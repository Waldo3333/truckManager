class Chantier < ApplicationRecord
  has_many :interventions, dependent: :destroy
  belongs_to :original, class_name: "Chantier", optional: true
  has_one :copy_chantier, class_name: "Chantier", foreign_key: "original_id", dependent: :destroy

  validates :name, presence: true
  validates :location, presence: true
  validates :duration, presence: true, numericality: { greater_than: 0 }
  validates :email, format: { with: URI::MailTo::EMAIL_REGEXP, allow_blank: true }
  validates :phone, format: { with: /\A[\d\s\-\+\(\)]+\z/, allow_blank: true }

  scope :scheduled_for, ->(date) { where(scheduled_date: date) }
  scope :unscheduled, -> { where(scheduled_date: nil) }
  scope :not_yet_planned, -> { left_joins(:interventions).where(interventions: { id: nil }) }
  scope :visible, -> { where(copy: false) }

  after_create :create_copy_if_needed
  after_update :sync_copy_if_needed

  def duration_in_hours
    (duration / 60.0).round(1)
  end

  def scheduled?
    scheduled_date.present?
  end

  def has_copy?
    copy_chantier.present?
  end

  def duplicate!
    Chantier.create!(copy_attributes.merge(copy: true, original_id: id))
  end

  private

  def copy_attributes
    attributes.except("id", "created_at", "updated_at", "copy", "original_id")
  end

  def create_copy_if_needed
    return unless two_operators? && !copy?
    duplicate!
  end

  def sync_copy_if_needed
    return if copy? # ne jamais toucher aux copies elles-mêmes

    if two_operators? && copy_chantier.present?
      # Mettre à jour la copie existante
      copy_chantier.destroy
      duplicate!
    elsif two_operators? && copy_chantier.blank?
      # Vient de cocher two_operators → créer la copie
      duplicate!
    elsif !two_operators? && copy_chantier.present?
      # Vient de décocher two_operators → supprimer la copie
      copy_chantier.destroy
    end
  end
end
