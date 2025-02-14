require 'rails_helper'
require_relative '../../../app/services/auth_token_services/create'

RSpec.describe AuthTokenServices::Create, type: :service do
  let(:user_id) { 1 }
  let(:service) { AuthTokenServices::Create.new(user_id) }

  describe '#initialize' do
    it 'sets the user_id correctly' do
      expect(service.user_id).to eq(user_id)
    end

    it 'sets the data as an empty hash initially' do
      expect(service.data).to eq({})
    end
  end

  describe '#call' do
    before { service.call }

    it 'sets the access_token' do
      expect(service.data[:access_token]).to be_present
    end

    it 'sets the expires_in field' do
      expect(service.data[:expires_in]).to be_present
    end

    it 'sets the expires_in to a value 24 hours from now' do
      expected_expiration = 24.hours.from_now.to_i
      expect(service.data[:expires_in]).to eq(expected_expiration)
    end

    it 'encodes a valid JWT access token' do
      decoded_token = JWT.decode(service.data[:access_token], ENV['SECRET_KEY'], true, algorithm: 'HS256')
      payload = decoded_token.first
      expect(payload['user_id']).to eq(user_id)
      expect(payload['exp']).to eq(service.data[:expires_in])
    end
  end
end
