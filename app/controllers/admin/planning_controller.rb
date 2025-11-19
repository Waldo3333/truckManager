# app/controllers/admin/planning_controller.rb
class Admin::PlanningController < ApplicationController
  before_action :require_admin

  def index
    @selected_date = params[:date]&.to_date || Date.today

    @trucks = Truck.all.order(:name)

    # Chantiers disponibles (pas encore planifiés ce jour)
    planned_chantier_ids = Intervention.where(date: @selected_date).pluck(:chantier_id)
    @chantiers = Chantier.where.not(id: planned_chantier_ids)
                         .where("scheduled_date = ? OR scheduled_date IS NULL", @selected_date)
  end
end
