# app/controllers/admin/chantiers_controller.rb
class Admin::ChantiersController < ApplicationController
  before_action :require_admin
  before_action :set_chantier, only: [:edit, :show, :update, :destroy]

  def index
    base = Chantier.order(created_at: :desc)

    @chantiers_non_programmes = base.left_joins(:interventions).where(interventions: { id: nil })
    @chantiers_programmes = base.joins(:interventions).distinct
    @chantiers_termines = base.where("scheduled_date < ?", Date.today).left_joins(:interventions).where(interventions: { id: nil })
  end

  def show
    # Render juste la partial pour AJAX
    render partial: 'admin/chantiers/info', locals: { chantier: @chantier }, layout: false
  end

  def new
    @chantier = Chantier.new
  end

  def create
    @chantier = Chantier.new(chantier_params)

    if @chantier.save
      redirect_to admin_chantiers_path, notice: "Chantier créé avec succès"
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
  end

  def update
    if @chantier.update(chantier_params)
      redirect_to admin_chantiers_path, notice: "Chantier mis à jour"
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @chantier.destroy
    redirect_to admin_chantiers_path, notice: "Chantier supprimé"
  end

  private

  def set_chantier
    @chantier = Chantier.find(params[:id])
  end

  def chantier_params
    params.require(:chantier).permit(:name, :location, :duration, :scheduled_date, :email, :phone, :description, :extra_equipment, :two_operators)
  end
end
