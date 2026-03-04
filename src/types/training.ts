export interface Course {
    id: string;
    title: string;
    thumbnail: string;
    duration: string;
    progress: number;
    level: number;
    youtubeId?: string;
}

export interface EmployeeProgress {
    id: string;
    name: string;
    avatar: string;
    role: string;
    overallProgress: number;
    badges: number[];
}
