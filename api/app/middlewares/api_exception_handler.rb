module Middleware
  class ApiExceptionHandler
    def initialize(app)
      @app = app
    end

    def call(env)
      begin
        @app.call(env)
      rescue Exceptions::ApiError => e
        json_response(e.response_body, e.status)
      rescue StandardError => e
        json_response({ error: "Server Error" }, :internal_server_error)
      end
    end

    private

    def json_response(body, status)
      [status, { 'Content-Type' => 'application/json' }, [body.to_json]]
    end
  end
end