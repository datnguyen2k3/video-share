import React from "react";
import Header from "@/components/Headers";
import styles from "../../styles/videoList.module.css";

const movies = [
    {
        id: 1,
        title: "Movie Title 1",
        sharedBy: "someone@gmail.com",
        likes: 89,
        dislikes: 12,
        description: "This is a great movie about...",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    },
    {
        id: 2,
        title: "Movie Title 2",
        sharedBy: "someone@gmail.com",
        likes: 120,
        dislikes: 5,
        description: "An amazing journey into...",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    },
    {
        id: 3,
        title: "Movie Title 3",
        sharedBy: "someone@gmail.com",
        likes: 45,
        dislikes: 8,
        description: "A thrilling story about...",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    },
];

const VideoList: React.FC = () => {
    return (
        <>
            <Header />
            <div className={styles.container}>
                {movies.map((movie) => (
                    <div key={movie.id} className={styles.movieCard}>
                        <iframe
                            className={styles.video}
                            src={movie.videoUrl}
                            title={movie.title}
                            frameBorder="0"
                            allowFullScreen
                        ></iframe>
                        <div className={styles.details}>
                            <h2 className={styles.title}>{movie.title}</h2>
                            <p className={styles.sharedBy}>
                                Shared by: {movie.sharedBy}
                            </p>
                            <p className={styles.reactions}>
                                {movie.likes} 👍 {movie.dislikes} 👎
                            </p>
                            <p className={styles.description}>
                                {movie.description}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
};

export default VideoList;
