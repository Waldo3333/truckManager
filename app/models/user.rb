class User < ApplicationRecord
  devise :database_authenticatable, :registerable,
         :recoverable, :rememberable, :validatable

  has_many :daily_assignments
  has_many :trucks, through: :daily_assignments

  def admin?
    admin
  end
end
