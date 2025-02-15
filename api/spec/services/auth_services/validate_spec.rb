require 'rails_helper'

RSpec.describe AuthTokenServices::Validate, type: :service do
  let(:user) { create(:user) }
  let(:valid_token) do
    payload = { user_id: user.id, exp: 24.hours.from_now.to_i }
    JWT.encode(payload, ENV['SECRET_KEY'])
  end
  let(:expired_token) do
    payload = { user_id: user.id, exp: 1.hour.ago.to_i }
    JWT.encode(payload, ENV['SECRET_KEY'])
  end
  let(:invalid_token) { 'invalid_token' }

  describe '#initialize' do
    it 'sets the token correctly' do
      service = described_class.new(valid_token)
      expect(service.token).to eq(valid_token)
    end
  end

  describe '#call' do
    context 'when the token is valid' do
      it 'returns the user associated with the token' do
        service = described_class.new(valid_token)
        result = service.call
        expect(result).to eq(user)
      end
    end

    context 'when the token is expired' do
      it 'raises an ExpiredTokenError' do
        service = described_class.new(expired_token)
        expect { service.call }.to raise_error(ExpiredTokenError)
      end
    end

    context 'when the token is invalid' do
      it 'raises an InvalidTokenError' do
        service = described_class.new(invalid_token)
        expect { service.call }.to raise_error(InvalidTokenError)
      end
    end

    context 'when the user does not exist' do
      it 'raises an InvalidTokenError' do
        payload = { user_id: -1, exp: 24.hours.from_now.to_i }
        invalid_user_token = JWT.encode(payload, ENV['SECRET_KEY'])

        service = described_class.new(invalid_user_token)
        expect { service.call }.to raise_error(InvalidTokenError)
      end
    end
  end
end
