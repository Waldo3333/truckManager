# config/routes.rb
Rails.application.routes.draw do
  devise_for :users

  # Route root intelligente basée sur le type d'utilisateur
  authenticated :user, ->(user) { user.admin? } do
    root to: "admin/dashboard#index", as: :admin_root
  end

  authenticated :user, ->(user) { !user.admin? } do
    root to: "employee/schedule#index", as: :employee_root
  end

  # Fallback pour les non-connectés
  root to: redirect('/users/sign_in')

  # ROUTES ADMIN
  namespace :admin do
    get 'planning', to: 'planning#index'
    get 'weekly_recap', to: 'weekly_recap#index'

    resources :chantiers
    resources :trucks
    resources :users
    resources :daily_assignments, only: [:create, :update, :destroy]

    resources :interventions, only: [:create, :update, :destroy] do
      collection do
        post :batch_update
      end
    end
  end

  # ROUTES EMPLOYÉS
  namespace :employee do
    get 'schedule', to: 'schedule#index'
    get 'schedule/calendar', to: 'schedule#calendar', as: 'schedule_calendar'
    get 'chantiers/:id', to: 'chantiers#show', as: 'chantier'
  end
end
