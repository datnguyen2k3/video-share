require 'rails_helper'

RSpec.describe ApiError do
  describe "#initialize" do
    it "sets default values when no arguments are provided" do
      error = ApiError.new

      expect(error.status).to eq(:bad_request)
      expect(error.error).to eq("Bad request")
      expect(error.details).to eq({})
    end

    it "allows custom status, error message, and details" do
      error = ApiError.new(:not_found, "Resource not found", { resource: "User" })

      expect(error.status).to eq(:not_found)
      expect(error.error).to eq("Resource not found")
      expect(error.details).to eq({ resource: "User" })
    end
  end

  describe "#response_body" do
    it "returns a hash with error message and details" do
      error = ApiError.new(:unauthorized, "Unauthorized access", { reason: "Invalid token" })

      expect(error.response_body).to eq({ error: "Unauthorized access", reason: "Invalid token" })
    end
  end
end
