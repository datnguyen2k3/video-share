require 'rails_helper'
require_relative '../../../app/services/auth_token_services/create'
require_relative '../../../app/services/user_services/login'

RSpec.describe UserServices::Login, type: :service do
  let(:email) { 'test@example.com' }
  let(:password) { 'password123' }
  let(:params) { { email: email, password: password } }
  let!(:user) { create(:user, email: 'test@example.com',
                              password: 'password123') }

  describe '#call' do
    context 'when the user does not exist' do
      let(:email) { 'invalid@example.com' }

      it 'raises NotFoundUserError' do
        service = described_class.new(params)
        expect { service.call }.to raise_error(NotFoundUserError)
      end
    end

    context 'when the password is incorrect' do
      let(:password) { 'invalid' }

      it 'raises InvalidPasswordError' do
        service = described_class.new(params)
        expect { service.call }.to raise_error(InvalidPasswordError)
      end
    end

    context 'when the user exists and password matches' do
      it 'creates an auth token' do
        service = described_class.new(params)
        expect_any_instance_of(AuthTokenServices::Create).to receive(:call)

        service.call
      end
    end
  end
end
