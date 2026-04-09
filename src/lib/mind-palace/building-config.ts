/**
 * Mind Palace 빌딩 설정
 * 하버드 철학관: 6층(=6 chapters), 각 층에 N개 강의실(=Scene_Pages)
 */

export interface RoomConfig {
  id: string;        // "301", "302"
  floor: number;
  roomNumber: number;
  label: string;     // "301호 강의실"
  sectionId: string; // 매핑될 StructuredSection id
}

export interface FloorConfig {
  floor: number;
  chapterId: string;
  chapterTitle: string;
  rooms: RoomConfig[];
  enabled: boolean; // structured data 존재 여부
}

export interface BuildingConfig {
  name: string;
  subject: string;
  floors: FloorConfig[];
}

export const ETHICS_BUILDING: BuildingConfig = {
  name: "하버드 철학관",
  subject: "생활과 윤리",
  floors: [
    {
      floor: 1,
      chapterId: "ch1",
      chapterTitle: "현대의 삶과 실천 윤리",
      enabled: false,
      rooms: [],
    },
    {
      floor: 2,
      chapterId: "ch2",
      chapterTitle: "생명과 윤리",
      enabled: false,
      rooms: [],
    },
    {
      floor: 3,
      chapterId: "ch3",
      chapterTitle: "사회와 윤리",
      enabled: true,
      rooms: [
        { id: "301", floor: 3, roomNumber: 1, label: "301호 강의실", sectionId: "ch3_s1" },
        { id: "302", floor: 3, roomNumber: 2, label: "302호 강의실", sectionId: "ch3_s2" },
        { id: "303", floor: 3, roomNumber: 3, label: "303호 강의실", sectionId: "ch3_s3" },
        { id: "304", floor: 3, roomNumber: 4, label: "304호 강의실", sectionId: "ch3_s4" },
      ],
    },
    {
      floor: 4,
      chapterId: "ch4",
      chapterTitle: "과학과 윤리",
      enabled: false,
      rooms: [],
    },
    {
      floor: 5,
      chapterId: "ch5",
      chapterTitle: "문화와 윤리",
      enabled: false,
      rooms: [],
    },
    {
      floor: 6,
      chapterId: "ch6",
      chapterTitle: "평화와 공존의 윤리",
      enabled: false,
      rooms: [],
    },
  ],
};
