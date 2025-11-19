class Chantier < ApplicationRecord
  has_many :interventions, dependent: :destroy

  validates :name, presence: true
  validates :location, presence: true
  validates :duration, presence: true, numericality: { greater_than: 0 }

  scope :scheduled_for, ->(date) { where(scheduled_date: date) }
  scope :unscheduled, -> { where(scheduled_date: nil) }
  scope :not_yet_planned, -> { left_joins(:interventions).where(interventions: { id: nil }) }

  def duration_in_hours
    (duration / 60.0).round(1)
  end

  def scheduled?
    scheduled_date.present?
  end
end
