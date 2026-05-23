# Gamelingo

게임을 하면서 영어 문장을 모으고, 내 문장으로 바꿔 말하는 Vite + React 앱입니다.

기본 게임인 `What Remains of Edith Finch`와 사용자가 직접 추가한 게임별 플레이 노트를 지원합니다.

## 문서

- `docs/spec.md`: Codex가 먼저 읽는 제품 범위와 데이터 계약 진입점
- `README.md`: 실행 방법, 사용 흐름, ohmesh 저장 형식, 게임 추가 위치
- `AGENTS.md`: 에이전트 검증과 커밋 규칙

## 실행 방법

```bash
npm install
npm run dev
```

기본 주소는 <http://localhost:5173/> 입니다.

검사용 명령:

```bash
npm run lint
npm run build
```

## 사용 방법

1. 홈 화면에서 기본 게임을 고르거나 `게임 추가`로 개인 게임을 만듭니다.
2. 로그인 전에는 게스트 모드로 이 브라우저에만 저장됩니다.
3. 상단의 `저장하기`를 누르면 ohmesh로 로그인하고 현재 브라우저 노트를 계정에 저장합니다.
4. 게임별 공부 페이지는 `/games/edith-finch`나 `/games/custom-game-...`처럼 고유 URL을 가집니다.
5. 커스텀 게임은 홈 화면에서 제목과 설명을 수정하거나 확인 후 삭제할 수 있습니다.
6. 공부 화면은 `prototype/template1.jsx` 기반의 보드 UI를 사용합니다.
7. 보드 위의 문장 노트를 드래그해서 장면 흐름에 맞게 배치합니다.
8. 게임 중 짧은 영어 문장을 발견하면 `노트 추가`에 원문을 그대로 입력합니다.
9. 오른쪽 단어 보드에 자주 들리는 단어와 뜻을 저장합니다.
10. `Game Notes`에는 장면, 인물 관계, 다음에 기억할 내용을 적습니다.
11. 하단 인물 레일에는 선택한 게임의 인물 이름과 짧은 설명을 추가합니다.
12. 필요하면 뜻과 내 문장을 가볍게 덧붙입니다.
13. 저장된 카드에서 `원문 듣기`와 `내 문장 듣기`를 눌러 소리 내서 연습합니다.
14. 익숙해진 문장은 `연습 완료`로 체크합니다.

모든 문장을 저장하려고 하지 않아도 됩니다. 한 번 플레이할 때 문장 3개면 충분하고, 긴 문장보다 내가 실제로 쓸 수 있는 짧은 문장이 좋습니다.

## ohmesh 데이터

로그인 전 노트는 브라우저 `localStorage`에 압축 저장됩니다. `저장하기`를 누르면 ohmesh 로그인을 거쳐 현재 브라우저 노트를 계정에 저장합니다. ohmesh 인증은 `ohmesh_session` HttpOnly 쿠키만 사용하며, 앱 코드에서 토큰을 직접 다루지 않습니다.

- 앱 슬러그: `gamelingo`
- 저장 record type: `gamelingo-study-state`
- record data: 개인 게임 목록과 게임별 미션 체크, 단어장, 단어 보드 메모, 스토리 메모, 문장 노트, 등장인물
- 게스트 저장 key: `gamelingo:v3:app:guest`

record data는 저장 크기를 줄이기 위해 압축 포맷으로 저장합니다. 기본 단어장, 기본 샘플 문장, 체크되지 않은 미션, 빈 커스텀 게임 노트는 저장하지 않습니다.

```js
{
  v: 3,
  g: [
    {
      id: "custom-game-lx9p2",
      title: "Portal 2",
      description: "퍼즐 대사를 내 문장으로 바꾸기",
      createdAt: "2026-05-23T00:00:00.000Z",
      updatedAt: "2026-05-23T00:00:00.000Z"
    }
  ],
  n: {
    "edith-finch": {
      x: "오늘 자주 들은 단어를 따로 적어둔다.",
      w: "alive: 살아 있는\nattic: 다락방",
      m: "오늘은 Finch 가족과 집에 대한 기억을 따라갔다.",
      c: 39,
      s: [
        {
          i: "sentence-1",
          t: "I remember",
          h: "Opening",
          o: "I remember.",
          k: "나는 기억한다.",
          r: "I remember my first day at work.",
          p: 1,
          x: 12,
          y: 18
        }
      ],
      p: [{ i: "character-1", n: "Edith Finch", d: "Finch 가족의 이야기를 따라가는 화자" }]
    }
  }
}
```

상위 압축 키는 `v` 버전, `g` 커스텀 게임 목록, `n` 게임별 노트입니다. 노트 안의 압축 키는 `x` 단어 보드 메모, `w` 단어 key:value 리스트, `m` 스토리 메모, `c` 미션 체크 bitmask, `s` 보드 문장 노트, `p` 등장인물입니다. 문장 노트에는 원문, 뜻, 내 문장, 연습 여부, 보드 좌표가 저장됩니다. 화면에서는 이 데이터를 다시 보드 UI 구조로 복원해서 사용합니다.

기존 `edith-finch-study-state` record와 `gamelingo:v2:edithFinch:guest` localStorage 데이터는 읽기 전용 fallback으로 불러와 새 v3 구조의 `edith-finch` 노트로 마이그레이션합니다. 데이터 구조가 깨진 경우에는 앱이 멈추지 않도록 기본 데이터로 되돌리는 처리를 넣었습니다.

## 게임 추가 방식

사용자는 홈 화면의 `게임 추가`에서 개인 게임을 추가합니다. 제목은 필수이고 설명은 선택입니다. 이미지는 입력받지 않으며 앱이 제목 기반 기본 커버를 표시합니다.

코드에 기본 게임을 추가할 때는 [src/App.jsx](src/App.jsx)의 `defaultGames`, 기본 노트 데이터, 필요하면 게임 전용 가이드를 함께 수정합니다. 사용자 추가 게임은 공통 공부 화면과 빈 노트로 시작합니다.
