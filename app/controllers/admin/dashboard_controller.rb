class Admin::DashboardController < ApplicationController
  before_action :require_admin

  def index
    @chantiers_count = Chantier.count
    @trucks_count = Truck.count
    @users_count = User.count
    @interventions_today = Intervention.where(date: Date.today).count
  end
end
