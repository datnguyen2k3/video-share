Rails.application.config.middleware.insert_before 0, Rack::Cors do
    allow do
    # todo: change this to the domain of your frontend
      origins 'http://13.212.217.117:3001'  # Allow requests from your React frontend
      resource '*',
        headers: :any,
        methods: [:get, :post, :put, :patch, :delete, :options, :head],
        credentials: true
    end
  end
  