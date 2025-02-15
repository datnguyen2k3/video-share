require 'rails_helper'
require_relative '../../../app/services/user_services/create'

RSpec.describe UserServices::Create, type: :service do
  let(:params) do
    {
      email: email,
      password: password,
      name: name
    }
  end
  let!(:email) { 'test@gmail.com' }
  let!(:password) { 'Pass@word01' }
  let!(:name) { 'John' }

  describe '#initialize' do
    it 'sets the params correctly' do
      service = described_class.new(params)
      expect(service.params).to eq(params)
    end
  end

  describe '#call' do
    context 'when the email is invalid' do
      let(:email) { 'invalid' }

      it 'raises an InvalidEmailError' do
        service = described_class.new(params)
        expect { service.call }.to raise_error(InvalidEmailError)
      end
    end

    context 'when the password is' do
      shared_examples 'raises InvalidPasswordError' do |password|
        let(:password) { password }

        it 'raises an InvalidPasswordError' do
          service = described_class.new(params)
          expect { service.call }.to raise_error(InvalidPasswordError)
        end
      end

      context 'too short' do
        include_examples 'raises InvalidPasswordError', '123'
      end

      context 'too long' do
        include_examples 'raises InvalidPasswordError', 'a' * 100
      end

      context 'not have uppercase' do
        include_examples 'raises InvalidPasswordError', 'aaaaaaaaaa'
      end

      context 'not have lowercase' do
        include_examples 'raises InvalidPasswordError', 'AAAAAAAAAA'
      end

      context 'not have digit' do
        include_examples 'raises InvalidPasswordError', 'Aaaaaaaaaa'
      end

      context 'not have special case' do
        include_examples 'raises InvalidPasswordError', 'Aaaaaaaaaa1'
      end

    end

    context 'when the name is' do
      shared_examples 'raises InvalidUserNameError' do |name|
        let!(:name) { name }

        it 'raises an InvalidUserNameError' do
          service = described_class.new(params)
          expect { service.call }.to raise_error(InvalidUserNameError)
        end
      end

      context 'too short' do
        include_examples 'raises InvalidUserNameError', 'aa'
      end

      context 'too long' do
        include_examples 'raises InvalidUserNameError', 'a' * 101
      end

      context 'blank' do
        include_examples 'raises InvalidUserNameError', '   '
      end

      context 'have non alphabet case' do
        include_examples 'raises InvalidUserNameError', 'Test __'
      end
    end

    context 'when the user already exists' do
      before do
        create(:user, email: params[:email])
      end

      it 'raises an ExistedUserError' do
        service = described_class.new(params)
        expect { service.call }.to raise_error(ExistedUserError)
      end
    end

    context 'when the params are valid' do
      it 'creates a new user' do
        service = described_class.new(params)
        user = service.call
        expect(user).to be_a(User)
        expect(user.email).to eq(params[:email])
        expect(user.name).to eq(params[:name])
      end
    end
  end
end
