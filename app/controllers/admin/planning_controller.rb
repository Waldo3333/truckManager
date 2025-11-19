class Admin::PlanningController < ApplicationController
  before_action :require_admin

  def index
    @selected_date = params[:date]&.to_date || Date.today
    @selected_truck = params[:truck_id].present? ? Truck.find(params[:truck_id]) : Truck.first

    @trucks = Truck.all

    # Chantiers prévus pour la date sélectionnée + chantiers sans date
    @chantiers = Chantier.where(scheduled_date: [@selected_date, nil])
                         .left_joins(:interventions)
                         .where(interventions: { id: nil })
                         .or(Chantier.where(scheduled_date: [@selected_date, nil])
                                     .left_joins(:interventions)
                                     .where.not(interventions: { date: @selected_date }))

    # Interventions du camion sélectionné pour la date
    @interventions = @selected_truck&.interventions&.where(date: @selected_date)&.order(:start_time) || []
  end
end
