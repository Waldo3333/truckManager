class DailyAssignment < ApplicationRecord
  belongs_to :user
  belongs_to :truck

  validates :date, presence: true
  validates :date, uniqueness: { scope: :truck_id }
  validates :date, uniqueness: { scope: :user_id }
end
