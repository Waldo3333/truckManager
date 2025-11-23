# config/routes.rb
Rails.application.routes.draw do
  devise_for :users

  root to: redirect('/admin')

  # ROUTES ADMIN

  namespace :admin do
    root to: "dashboard#index"

    get 'planning', to: 'planning#index'
    get 'weekly_recap', to: 'weekly_recap#index'  # NOUVELLE ROUTE

    resources :chantiers
    resources :trucks
    resources :users
    resources :daily_assignments, only: [:create, :update, :destroy]
    resources :interventions, only: [:create, :update, :destroy]
  end

  # ROUTES EMPLOYÉS
  namespace :employee do
    root to: "schedule#index"
    get 'schedule', to: 'schedule#index'
    get 'schedule/calendar', to: 'schedule#calendar', as: 'schedule_calendar'
    get 'chantiers/:id', to: 'chantiers#show', as: 'chantier'

  end
end
