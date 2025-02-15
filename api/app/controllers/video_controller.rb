require_relative '../services/video_services/create'
require_relative '../services/video_services/get_by_cursor'

class VideoController < ApplicationController
  skip_before_action :verify_authenticity_token

  def create
    video = ::VideoServices::Create.new(
      create_video_params,
      current_user
    ).call
    render json: {
      video: VideoSerializer.new(video).serializable_hash
    }, status: :created
  end

  def get
    data = ::VideoServices::GetByCursor.new(params[:cursor]).call
    response_videos = data[:videos].map do |video|
      VideoSerializer.new(video).serializable_hash
    end
    render json: {
      videos: response_videos,
      next_cursor: data[:next_cursor]
    }, status: :ok
  end

  private

  def create_video_params
    {
      owner_id: current_user.id,
      url: params[:url],
    }
  end
end