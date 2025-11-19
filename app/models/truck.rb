class Truck < ApplicationRecord
  has_many :daily_assignments
  has_many :interventions

  validates :name, presence: true
end
