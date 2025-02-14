require 'rails_helper'

RSpec.describe ApiExceptionHandlerMiddleware do
  let(:app) { ->(_env) { [200, { 'Content-Type' => 'application/json' }, ['{"message": "Success"}']] } }
  let(:middleware) { described_class.new(app) }
  let(:env) { {} }

  context "when no exception occurs" do
    it "calls the app and returns a successful response" do
      status, headers, body = middleware.call(env)

      expect(status).to eq(200)
      expect(headers['Content-Type']).to eq('application/json')
      expect(body).to eq(['{"message": "Success"}'])
    end
  end

  context "when an ApiError occurs" do
    let(:app) { ->(_env) { raise ApiError.new(400, "Custom error") } }

    it "returns the custom API error response" do
      status, headers, body = middleware.call(env)

      expect(status).to eq(400)
      expect(headers['Content-Type']).to eq('application/json')
      expect(body).to eq(['{"error":"Custom error"}'])
    end
  end

  context "when a StandardError occurs" do
    let(:app) { ->(_env) { raise StandardError.new("Something went wrong") } }

    it "returns a generic server error response" do
      status, headers, body = middleware.call(env)

      expect(status).to eq(500)
      expect(headers['Content-Type']).to eq('application/json')
      expect(body).to eq(['{"error":"Server Error"}'])
    end
  end
end
