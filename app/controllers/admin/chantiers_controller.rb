class Admin::ChantiersController < ApplicationController
  before_action :require_admin
  before_action :set_chantier, only: [:edit, :show, :update, :destroy, :duplicate]


  def index
    base = Chantier.visible.includes(:copy_chantier).order(created_at: :desc)

    @chantiers_non_programmes = base.left_joins(:interventions).where(interventions: { id: nil })
    @chantiers_programmes = base.joins(:interventions).where("interventions.date >= ?", Date.today).distinct
    @chantiers_termines = base.joins(:interventions).where("interventions.date < ?", Date.today).distinct
  end

  def show
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

  def duplicate
    @chantier.duplicate!
    redirect_to admin_chantiers_path, notice: "Chantier dupliqué"
  end

  private

  def set_chantier
    @chantier = Chantier.find(params[:id])
  end

  def chantier_params
    params.require(:chantier).permit(:name, :location, :duration, :scheduled_date, :email, :phone, :description, :extra_equipment, :two_operators)
  end
end
