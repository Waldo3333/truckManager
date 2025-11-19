# app/controllers/admin/trucks_controller.rb
class Admin::TrucksController < ApplicationController
  before_action :require_admin
  before_action :set_truck, only: [:edit, :update, :destroy]

  def index
    @trucks = Truck.all.order(created_at: :desc)
  end

  def new
    @truck = Truck.new
  end

  def create
    @truck = Truck.new(truck_params)

    if @truck.save
      redirect_to admin_trucks_path, notice: "Camion créé avec succès"
    else
      render :new, status: :unprocessable_entity
    end
  end

  def edit
  end

  def update
    if @truck.update(truck_params)
      redirect_to admin_trucks_path, notice: "Camion mis à jour"
    else
      render :edit, status: :unprocessable_entity
    end
  end

  def destroy
    @truck.destroy
    redirect_to admin_trucks_path, notice: "Camion supprimé"
  end

  private

  def set_truck
    @truck = Truck.find(params[:id])
  end

  def truck_params
    params.require(:truck).permit(:name)
  end
end
