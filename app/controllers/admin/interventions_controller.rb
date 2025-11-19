# app/controllers/admin/interventions_controller.rb
class Admin::InterventionsController < ApplicationController
  before_action :require_admin
  before_action :set_intervention, only: [:update, :destroy]

  def create
    @intervention = Intervention.new(intervention_params)

    if @intervention.save
      render json: { success: true, intervention: @intervention }
    else
      render json: { success: false, error: @intervention.errors.full_messages.join(', ') }, status: :unprocessable_entity
    end
  end

  def update
    if @intervention.update(intervention_params)
      render json: { success: true, intervention: @intervention }
    else
      render json: { success: false, error: @intervention.errors.full_messages.join(', ') }, status: :unprocessable_entity
    end
  end

  def destroy
    @intervention.destroy
    render json: { success: true }
  end

  private

  def set_intervention
    @intervention = Intervention.find(params[:id])
  end

  def intervention_params
    params.require(:intervention).permit(:chantier_id, :truck_id, :date, :start_time)
  end
end
