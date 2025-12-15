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
      # Précharger toutes les interventions à modifier en une seule requête
      intervention_ids = params[:updates]&.map { |u| u[:id] } || []
      interventions_hash = Intervention.where(id: intervention_ids).index_by(&:id)

      # Modifications
      params[:updates]&.each do |update_params|
        intervention = interventions_hash[update_params[:id].to_i]

        unless intervention
          render json: { success: false, error: "Intervention #{update_params[:id]} introuvable" }
          raise ActiveRecord::Rollback
          return
        end

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

      # Suppressions en batch
      if params[:deletes]&.any?
        deleted_count = Intervention.where(id: params[:deletes]).destroy_all.count

        if deleted_count != params[:deletes].length
          render json: { success: false, error: "Certaines interventions n'ont pas pu être supprimées" }
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
