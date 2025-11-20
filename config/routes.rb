# config/routes.rb
Rails.application.routes.draw do
  devise_for :users

  root to: redirect('/admin')

  namespace :admin do
    root to: "dashboard#index"

    get 'planning', to: 'planning#index'

    resources :chantiers
    resources :trucks
    resources :users
    resources :daily_assignments, only: [:create, :update, :destroy]
    resources :interventions, only: [:create, :update, :destroy]
  end
end
