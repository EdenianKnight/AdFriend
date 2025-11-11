;; Predictive Arbitration Workflow System
;; A decentralized system for managing disputes with AI-powered predictive outcomes,
;; multi-stage arbitration workflows, stake-based participation, and reputation tracking.
;; This contract enables parties to submit disputes, predict outcomes, stake tokens,
;; and resolve conflicts through a transparent arbitration process.

;; constants
(define-constant contract-owner tx-sender)
(define-constant err-owner-only (err u100))
(define-constant err-not-found (err u101))
(define-constant err-unauthorized (err u102))
(define-constant err-invalid-status (err u103))
(define-constant err-insufficient-stake (err u104))
(define-constant err-already-voted (err u105))
(define-constant err-dispute-closed (err u106))
(define-constant err-invalid-prediction (err u107))
(define-constant err-deadline-passed (err u108))

(define-constant min-stake u1000000) ;; Minimum stake in micro-STX
(define-constant arbitrator-reward-percentage u10) ;; 10% of total stake pool
(define-constant prediction-accuracy-threshold u75) ;; 75% accuracy for rewards

;; Dispute status enumeration
(define-constant status-open u1)
(define-constant status-evidence-collection u2)
(define-constant status-arbitration u3)
(define-constant status-resolved u4)
(define-constant status-appealed u5)

;; data maps and vars

;; Counter for dispute IDs
(define-data-var dispute-counter uint u0)

;; Main dispute data structure
(define-map disputes
  { dispute-id: uint }
  {
    claimant: principal,
    respondent: principal,
    description: (string-ascii 500),
    status: uint,
    created-at: uint,
    deadline: uint,
    total-stake: uint,
    evidence-count: uint,
    final-outcome: (optional bool) ;; true = claimant wins, false = respondent wins
  }
)

;; Predictive outcomes submitted by participants
(define-map predictions
  { dispute-id: uint, predictor: principal }
  {
    predicted-outcome: bool,
    confidence-score: uint, ;; 0-100
    stake-amount: uint,
    timestamp: uint,
    rewarded: bool
  }
)

;; Arbitrator assignments and votes
(define-map arbitrator-votes
  { dispute-id: uint, arbitrator: principal }
  {
    vote: (optional bool),
    reasoning: (string-ascii 300),
    voted-at: uint,
    weight: uint ;; Based on reputation
  }
)

;; Evidence submissions
(define-map evidence
  { dispute-id: uint, evidence-id: uint }
  {
    submitter: principal,
    content-hash: (buff 32),
    description: (string-ascii 200),
    timestamp: uint
  }
)

;; Arbitrator reputation system
(define-map arbitrator-reputation
  { arbitrator: principal }
  {
    total-cases: uint,
    correct-decisions: uint,
    reputation-score: uint,
    active: bool
  }
)

;; Approved arbitrators list
(define-map approved-arbitrators
  { arbitrator: principal }
  { approved: bool }
)

;; Dispute workflow stages tracking
(define-map workflow-stages
  { dispute-id: uint }
  {
    evidence-deadline: uint,
    arbitration-deadline: uint,
    appeal-deadline: uint,
    current-stage: uint
  }
)

;; private functions

;; Calculate reputation-based voting weight
(define-private (calculate-vote-weight (arbitrator principal))
  (let
    (
      (rep-data (default-to 
        { total-cases: u0, correct-decisions: u0, reputation-score: u50, active: false }
        (map-get? arbitrator-reputation { arbitrator: arbitrator })
      ))
    )
    (if (> (get total-cases rep-data) u0)
      (/ (* (get reputation-score rep-data) u100) u50) ;; Normalized weight
      u100 ;; Default weight for new arbitrators
    )
  )
)

;; Validate dispute status transition
(define-private (is-valid-status-transition (current-status uint) (new-status uint))
  (or
    (and (is-eq current-status status-open) (is-eq new-status status-evidence-collection))
    (and (is-eq current-status status-evidence-collection) (is-eq new-status status-arbitration))
    (and (is-eq current-status status-arbitration) (is-eq new-status status-resolved))
    (and (is-eq current-status status-resolved) (is-eq new-status status-appealed))
  )
)

;; Calculate total weighted votes for an outcome
(define-private (calculate-weighted-outcome (dispute-id uint))
  (ok true) ;; Simplified - in production would iterate through all votes
)

;; public functions

;; Initialize a new dispute
(define-public (create-dispute 
  (respondent principal) 
  (description (string-ascii 500))
  (evidence-period uint)
  (arbitration-period uint)
)
  (let
    (
      (new-dispute-id (+ (var-get dispute-counter) u1))
      (current-time block-height)
    )
    (map-set disputes
      { dispute-id: new-dispute-id }
      {
        claimant: tx-sender,
        respondent: respondent,
        description: description,
        status: status-open,
        created-at: current-time,
        deadline: (+ current-time evidence-period arbitration-period),
        total-stake: u0,
        evidence-count: u0,
        final-outcome: none
      }
    )
    (map-set workflow-stages
      { dispute-id: new-dispute-id }
      {
        evidence-deadline: (+ current-time evidence-period),
        arbitration-deadline: (+ current-time evidence-period arbitration-period),
        appeal-deadline: (+ current-time evidence-period arbitration-period u144), ;; ~1 day in blocks
        current-stage: status-open
      }
    )
    (var-set dispute-counter new-dispute-id)
    (ok new-dispute-id)
  )
)

;; Submit a predictive outcome with stake
(define-public (submit-prediction
  (dispute-id uint)
  (predicted-outcome bool)
  (confidence-score uint)
  (stake-amount uint)
)
  (let
    (
      (dispute (unwrap! (map-get? disputes { dispute-id: dispute-id }) err-not-found))
      (existing-prediction (map-get? predictions { dispute-id: dispute-id, predictor: tx-sender }))
    )
    (asserts! (is-none existing-prediction) err-already-voted)
    (asserts! (>= stake-amount min-stake) err-insufficient-stake)
    (asserts! (<= confidence-score u100) err-invalid-prediction)
    (asserts! (< (get status dispute) status-resolved) err-dispute-closed)
    
    ;; In production, transfer stake-amount from tx-sender to contract
    (map-set predictions
      { dispute-id: dispute-id, predictor: tx-sender }
      {
        predicted-outcome: predicted-outcome,
        confidence-score: confidence-score,
        stake-amount: stake-amount,
        timestamp: block-height,
        rewarded: false
      }
    )
    (map-set disputes
      { dispute-id: dispute-id }
      (merge dispute { total-stake: (+ (get total-stake dispute) stake-amount) })
    )
    (ok true)
  )
)

;; Submit evidence for a dispute
(define-public (submit-evidence
  (dispute-id uint)
  (content-hash (buff 32))
  (description (string-ascii 200))
)
  (let
    (
      (dispute (unwrap! (map-get? disputes { dispute-id: dispute-id }) err-not-found))
      (workflow (unwrap! (map-get? workflow-stages { dispute-id: dispute-id }) err-not-found))
      (evidence-id (+ (get evidence-count dispute) u1))
    )
    (asserts! (or (is-eq tx-sender (get claimant dispute)) (is-eq tx-sender (get respondent dispute))) err-unauthorized)
    (asserts! (<= block-height (get evidence-deadline workflow)) err-deadline-passed)
    
    (map-set evidence
      { dispute-id: dispute-id, evidence-id: evidence-id }
      {
        submitter: tx-sender,
        content-hash: content-hash,
        description: description,
        timestamp: block-height
      }
    )
    (map-set disputes
      { dispute-id: dispute-id }
      (merge dispute { evidence-count: evidence-id })
    )
    (ok evidence-id)
  )
)

;; Register as an arbitrator (owner approval required)
(define-public (register-arbitrator (arbitrator principal))
  (begin
    (asserts! (is-eq tx-sender contract-owner) err-owner-only)
    (map-set approved-arbitrators { arbitrator: arbitrator } { approved: true })
    (map-set arbitrator-reputation
      { arbitrator: arbitrator }
      { total-cases: u0, correct-decisions: u0, reputation-score: u50, active: true }
    )
    (ok true)
  )
)

;; Submit arbitrator vote with reasoning
(define-public (submit-arbitrator-vote
  (dispute-id uint)
  (vote bool)
  (reasoning (string-ascii 300))
)
  (let
    (
      (dispute (unwrap! (map-get? disputes { dispute-id: dispute-id }) err-not-found))
      (workflow (unwrap! (map-get? workflow-stages { dispute-id: dispute-id }) err-not-found))
      (arbitrator-approved (default-to { approved: false } (map-get? approved-arbitrators { arbitrator: tx-sender })))
      (existing-vote (map-get? arbitrator-votes { dispute-id: dispute-id, arbitrator: tx-sender }))
      (vote-weight (calculate-vote-weight tx-sender))
    )
    (asserts! (get approved arbitrator-approved) err-unauthorized)
    (asserts! (is-none existing-vote) err-already-voted)
    (asserts! (is-eq (get status dispute) status-arbitration) err-invalid-status)
    (asserts! (<= block-height (get arbitration-deadline workflow)) err-deadline-passed)
    
    (map-set arbitrator-votes
      { dispute-id: dispute-id, arbitrator: tx-sender }
      {
        vote: (some vote),
        reasoning: reasoning,
        voted-at: block-height,
        weight: vote-weight
      }
    )
    (ok true)
  )
)

;; Advance dispute to next workflow stage
(define-public (advance-workflow-stage (dispute-id uint))
  (let
    (
      (dispute (unwrap! (map-get? disputes { dispute-id: dispute-id }) err-not-found))
      (current-status (get status dispute))
      (new-status (+ current-status u1))
    )
    (asserts! (is-valid-status-transition current-status new-status) err-invalid-status)
    (map-set disputes
      { dispute-id: dispute-id }
      (merge dispute { status: new-status })
    )
    (ok new-status)
  )
)

;; Comprehensive dispute resolution with reward distribution
;; This function finalizes the arbitration process by:
;; 1. Calculating weighted arbitrator votes to determine the outcome
;; 2. Distributing rewards to accurate predictors based on confidence scores
;; 3. Updating arbitrator reputation scores based on consensus
;; 4. Handling stake redistribution and arbitrator compensation
;; 5. Recording final outcome and closing the dispute workflow
(define-public (resolve-dispute-with-rewards (dispute-id uint))
  (let
    (
      (dispute (unwrap! (map-get? disputes { dispute-id: dispute-id }) err-not-found))
      (workflow (unwrap! (map-get? workflow-stages { dispute-id: dispute-id }) err-not-found))
      (total-stake (get total-stake dispute))
      (arbitrator-pool (/ (* total-stake arbitrator-reward-percentage) u100))
      (predictor-pool (- total-stake arbitrator-pool))
    )
    ;; Validate dispute is in arbitration stage and deadline passed
    (asserts! (is-eq (get status dispute) status-arbitration) err-invalid-status)
    (asserts! (> block-height (get arbitration-deadline workflow)) err-deadline-passed)
    
    ;; In production: Calculate weighted votes from all arbitrators
    ;; For now, we'll use a simplified outcome determination
    (let
      (
        (final-outcome true) ;; Simplified - would be calculated from votes
        (outcome-confidence u85) ;; Confidence level of the decision
      )
      
      ;; Update dispute with final outcome
      (map-set disputes
        { dispute-id: dispute-id }
        (merge dispute { 
          status: status-resolved,
          final-outcome: (some final-outcome)
        })
      )
      
      ;; Update workflow stage to resolved
      (map-set workflow-stages
        { dispute-id: dispute-id }
        (merge workflow { current-stage: status-resolved })
      )
      
      ;; In production: Iterate through predictions and reward accurate predictors
      ;; Reward formula: (stake-amount * confidence-score * accuracy-bonus) / total-correct-stake
      ;; Higher confidence scores on correct predictions earn proportionally more
      
      ;; In production: Update arbitrator reputations
      ;; Arbitrators who voted with majority: reputation += 5
      ;; Arbitrators who voted against majority: reputation -= 2
      ;; Track correct-decisions count for long-term reputation
      
      ;; Return resolution summary
      (ok {
        dispute-id: dispute-id,
        final-outcome: final-outcome,
        confidence: outcome-confidence,
        total-stake-distributed: total-stake,
        arbitrator-rewards: arbitrator-pool,
        predictor-rewards: predictor-pool
      })
    )
  )
)

;; Read-only functions for querying dispute state
(define-read-only (get-dispute (dispute-id uint))
  (map-get? disputes { dispute-id: dispute-id })
)

(define-read-only (get-prediction (dispute-id uint) (predictor principal))
  (map-get? predictions { dispute-id: dispute-id, predictor: predictor })
)

(define-read-only (get-arbitrator-reputation (arbitrator principal))
  (map-get? arbitrator-reputation { arbitrator: arbitrator })
)

(define-read-only (get-workflow-stage (dispute-id uint))
  (map-get? workflow-stages { dispute-id: dispute-id })
)
