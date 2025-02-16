module VideoServices
  class GetByCursor

    attr_reader :cursor, :limit, :videos, :next_cursor

    def initialize(cursor, limit = 10)
      @cursor = cursor
      @limit = limit
      @videos = []
      @next_cursor = nil
    end

    def call
      if cursor
        end_id = cursor.to_i
        return result if end_id < 1

        start_id = end_id - limit + 1
        start_id = 1 if start_id < 1

        @videos = ::Video.where("id >= ?", start_id)
                         .where("id <= ?", end_id)
                         .order(id: :desc)
      else
        @videos = ::Video.order(id: :desc).limit(limit)
      end

      return result if videos.empty? || videos.last.id == 1

      @next_cursor = videos.last.id - 1
      result
    end

    def result
      {
        videos: videos,
        next_cursor: next_cursor
      }
    end
  end
end
