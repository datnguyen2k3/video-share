require 'rails_helper'
require_relative '../../../app/services/video_services/get_by_cursor'

RSpec.describe VideoServices::GetByCursor, type: :service do
  let!(:video1) { create(:video, id: 1) }
  let!(:video2) { create(:video, id: 2) }
  let!(:video3) { create(:video, id: 3) }

  describe '#call' do
    context 'when cursor is nil' do
      it 'returns the first set of videos' do
        service = described_class.new(nil, 2)
        result = service.call

        expect(result[:videos].size).to eq(2)
        expect(result[:videos].first.id).to eq(3)
        expect(result[:videos].last.id).to eq(2)
        expect(result[:next_cursor]).to eq(1)
      end
    end

    context 'when cursor is set to a specific ID' do
      it 'returns videos after the given cursor' do
        service = described_class.new(2, 2)
        result = service.call

        expect(result[:videos].size).to eq(2)
        expect(result[:videos].first.id).to eq(2)
        expect(result[:next_cursor]).to be_nil
      end
    end

    context 'when cursor is not number' do
      it 'returns set of last videos' do
        service = described_class.new("aa", 2)
        result = service.call

        expect(result[:videos].size).to eq(2)
        expect(result[:next_cursor]).to eq(1)
      end
    end

    context 'when cursor is too large' do
      it 'returns the empty' do
        service = described_class.new(100000)
        result = service.call

        expect(result[:videos]).to be_empty
        expect(result[:next_cursor]).to be_nil
      end
    end
  end
end
