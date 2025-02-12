require_relative '../services/video_services/create'
require_relative '../services/video_services/get_by_cursor'

class VideoController < ApplicationController
  skip_before_action :verify_authenticity_token

  def create
    video = ::VideoServices::Create.new(create_video_params).call
    render json: {
      video: VideoSerializer.new(video).serializable_hash
    }, status: :created
  end

  def get
    data = ::VideoServices::GetByCursor.new(params[:cursor]).call
    render json: data, status: :ok
  end

  private

  def create_video_params
    {
      owner_id: current_user.id,
      url: params[:url],
    }
  end
end