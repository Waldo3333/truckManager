# app/models/intervention.rb
class Intervention < ApplicationRecord
  belongs_to :truck
  belongs_to :chantier

  validates :date, presence: true
  validates :start_time, presence: true

  # Helper pour récupérer le conducteur du jour
  def driver
    DailyAssignment.find_by(truck: truck, date: date)&.user
  end

  # Calculer automatiquement l'heure de fin
  def end_time
    return nil unless start_time && chantier
    start_time + (chantier.duration * 60) # duration en minutes, converti en secondes
  end

  # Durée de l'intervention (héritée du chantier)
  def duration_in_minutes
    chantier&.duration || 0
  end
end
