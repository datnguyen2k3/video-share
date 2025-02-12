class CreateVideos < ActiveRecord::Migration[7.1]
  def change
    create_table :videos do |t|
      t.references :owner, foreign_key: { to_table: :users }
      t.string :youtube_id

      t.timestamps
    end
  end
end
