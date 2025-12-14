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

  def batch_update
    ActiveRecord::Base.transaction do
      # Créations
      params[:creates]&.each do |create_params|
        intervention = Intervention.new(
          chantier_id: create_params[:chantier_id],
          truck_id: create_params[:truck_id],
          date: create_params[:date],
          start_time: create_params[:start_time]
        )

        unless intervention.save
          render json: { success: false, error: intervention.errors.full_messages.join(', ') }
          raise ActiveRecord::Rollback
          return
        end
      end

      # Modifications
      params[:updates]&.each do |update_params|
        intervention = Intervention.find(update_params[:id])

        unless intervention.update(
          truck_id: update_params[:truck_id],
          date: update_params[:date],
          start_time: update_params[:start_time]
        )
          render json: { success: false, error: intervention.errors.full_messages.join(', ') }
          raise ActiveRecord::Rollback
          return
        end
      end

      # Suppressions
      params[:deletes]&.each do |intervention_id|
        intervention = Intervention.find(intervention_id)

        unless intervention.destroy
          render json: { success: false, error: "Impossible de supprimer l'intervention" }
          raise ActiveRecord::Rollback
          return
        end
      end

      render json: { success: true, message: "Toutes les modifications ont été sauvegardées" }
    end
  rescue => e
    render json: { success: false, error: e.message }
  end

  private

  def set_intervention
    @intervention = Intervention.find(params[:id])
  end

  def intervention_params
    params.require(:intervention).permit(:chantier_id, :truck_id, :date, :start_time)
  end
end
