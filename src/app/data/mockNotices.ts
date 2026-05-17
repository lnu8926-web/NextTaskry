import { Notice } from "@/types/notice";

export const mockNotices: Notice[] = [
  {
    announcement_id: "notice-001",
    user_id: "user-001",
    title: "[필독] 서비스 점검 안내 (2026-05-25 02:00–04:00)",
    content: `안녕하세요, Taskry 팀입니다.

정기 서버 점검으로 인해 아래 시간 동안 서비스를 일시 중단합니다.

- 점검 일시: 2026년 5월 25일 (월) 오전 2:00 ~ 4:00
- 점검 내용: DB 마이그레이션, 보안 패치 적용

점검 중에는 로그인 및 데이터 저장이 불가합니다.
작업 중인 내용은 미리 저장해두시기 바랍니다.

불편을 드려 죄송합니다.`,
    is_important: true,
    created_at: "2026-05-15T10:00:00Z",
    updated_at: "2026-05-15T10:00:00Z",
  },
  {
    announcement_id: "notice-002",
    user_id: "user-001",
    title: "[업데이트] 칸반 보드 드래그 앤 드롭 개선",
    content: `칸반 보드의 드래그 앤 드롭 기능이 업데이트되었습니다.

**주요 변경사항:**
- 태스크를 컬럼 간 이동 시 애니메이션 추가
- 여러 태스크 동시 선택 기능 지원
- 모바일 터치 드래그 안정성 개선

피드백은 하단 문의 채널로 남겨주세요.`,
    is_important: false,
    created_at: "2026-05-12T09:00:00Z",
    updated_at: "2026-05-12T09:00:00Z",
  },
  {
    announcement_id: "notice-003",
    user_id: "user-001",
    title: "[공지] 5월 정기 팀 회의 일정 안내",
    content: `5월 정기 팀 회의 일정을 안내드립니다.

- 일시: 2026년 5월 20일 (수) 오후 2:00
- 장소: 화상 회의 (링크는 채널에 공유)
- 안건: 1분기 성과 리뷰, 2분기 로드맵 논의

참석 여부를 5월 18일까지 회신해주세요.`,
    is_important: false,
    created_at: "2026-05-10T14:00:00Z",
    updated_at: "2026-05-10T14:00:00Z",
  },
  {
    announcement_id: "notice-004",
    user_id: "user-001",
    title: "[필독] 개인정보 처리방침 개정 안내",
    content: `개인정보 처리방침이 2026년 6월 1일부로 개정됩니다.

주요 변경사항:
1. 수집 항목에 '서비스 이용 기록' 추가
2. 제3자 제공 조항 명확화
3. 보관 기간 세분화

개정된 처리방침은 공지일로부터 14일 후 적용됩니다.
자세한 내용은 개인정보 처리방침 페이지를 확인해주세요.`,
    is_important: true,
    created_at: "2026-05-05T10:00:00Z",
    updated_at: "2026-05-05T10:00:00Z",
  },
  {
    announcement_id: "notice-005",
    user_id: "user-001",
    title: "[업데이트] 캘린더 멀티뷰 기능 출시",
    content: `요청이 많았던 캘린더 멀티뷰 기능이 출시되었습니다.

지원 뷰:
- 월간 뷰 (기존)
- 주간 뷰 (신규)
- 일간 뷰 (신규)
- 어젠다 뷰 (신규)

프로젝트 워크스페이스 내 캘린더 탭에서 바로 이용하실 수 있습니다.`,
    is_important: false,
    created_at: "2026-04-28T09:00:00Z",
    updated_at: "2026-04-28T09:00:00Z",
  },
  {
    announcement_id: "notice-006",
    user_id: "user-001",
    title: "[공지] 다크모드 정식 지원 시작",
    content: `Taskry에서 다크모드를 정식으로 지원합니다.

GNB 우측 상단의 테마 토글 버튼을 통해 라이트/다크 모드를 전환할 수 있습니다.
선택한 테마는 브라우저에 저장되어 다음 방문 시에도 유지됩니다.`,
    is_important: false,
    created_at: "2026-04-20T10:00:00Z",
    updated_at: "2026-04-20T10:00:00Z",
  },
  {
    announcement_id: "notice-007",
    user_id: "user-001",
    title: "[업데이트] 프로젝트 메모 기능 추가",
    content: `프로젝트 워크스페이스에 메모 기능이 추가되었습니다.

주요 기능:
- 메모 작성 및 수정/삭제
- 메모 고정(핀) 기능
- 색상 레이블 (빨강/주황/노랑/초록/파랑/보라)
- 이모지 반응 추가

팀원들과 빠르게 메모를 공유해보세요!`,
    is_important: false,
    created_at: "2026-04-10T09:00:00Z",
    updated_at: "2026-04-10T09:00:00Z",
  },
  {
    announcement_id: "notice-008",
    user_id: "user-001",
    title: "[필독] GitHub OAuth 로그인 추가 안내",
    content: `이제 GitHub 계정으로도 Taskry에 로그인할 수 있습니다.

로그인 페이지에서 'GitHub으로 로그인' 버튼을 통해 이용해주세요.
기존 Google 계정 로그인도 계속 지원됩니다.

같은 이메일로 여러 OAuth를 연결하는 기능은 추후 지원 예정입니다.`,
    is_important: true,
    created_at: "2026-03-15T10:00:00Z",
    updated_at: "2026-03-15T10:00:00Z",
  },
];

export const STORAGE_KEY = "notice_storage";
