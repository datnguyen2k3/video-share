require 'rails_helper'

RSpec.describe UserSerializer do
  let(:user) { create(:user) }
  let(:serializer) { described_class.new(user) }
  let(:serialization) { ActiveModelSerializers::Adapter.create(serializer).as_json }

  it "includes the expected attributes" do
    expected_keys = [:id, :name, :email, :created_at, :updated_at]
    expect(serialization.keys).to match_array(expected_keys)
  end

  it "serializes the correct values" do
    expect(serialization[:id]).to eq(user.id)
    expect(serialization[:name]).to eq(user.name)
    expect(serialization[:email]).to eq(user.email)
    expect(serialization[:created_at]).to eq(user.created_at.iso8601)
    expect(serialization[:updated_at]).to eq(user.updated_at.iso8601)
  end
end
