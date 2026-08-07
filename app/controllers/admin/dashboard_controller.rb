class Admin::DashboardController < ApplicationController
  before_action :require_admin

  def index
    @chantiers_count = Chantier.count
    @trucks_count = Truck.count
    @users_count = User.count
    @interventions_today = Intervention.where(date: Date.today).count
    @interventions_tomorrow = Intervention.where(date: Date.tomorrow).count
    @trucks = Truck.all.order(:name)
    @week_start = Date.today.beginning_of_week
    @week_end = Date.today.end_of_week
    @chantiers_a_planifier = Chantier.left_joins(:interventions).where(interventions: { id: nil }).count
    @chantiers_planifies = base.joins(:interventions).where("interventions.date >= ?", Date.today).distinct

  end
end
