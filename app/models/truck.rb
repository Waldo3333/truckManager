# app/models/truck.rb
class Truck < ApplicationRecord
  has_many :daily_assignments, dependent: :destroy
  has_many :interventions, dependent: :destroy

  validates :name, presence: true
end
