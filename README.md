# Gamelingo

게임을 하면서 영어 문장을 모으고, 내 문장으로 바꿔 말하는 Vite + React 앱입니다.

현재 1차 버전에는 `What Remains of Edith Finch` 플레이 노트가 구현되어 있습니다. 다른 게임은 나중에 `games` 배열과 페이지 렌더링 부분에 추가할 수 있습니다.

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

1. ohmesh로 로그인합니다.
2. 홈 화면에서 `What Remains of Edith Finch`를 선택합니다.
3. 게임별 공부 페이지는 `/games/edith-finch`처럼 고유 URL을 가집니다.
4. 상단의 `플레이 미션 보기`를 누르면 선택한 게임에 맞는 설명 팝업이 열립니다.
5. `이번 플레이 미션`에서 이번 플레이 때 챙길 작은 목표를 체크합니다.
6. 게임 중 짧은 영어 문장을 발견하면 `문장 추가`에 원문을 그대로 입력합니다.
7. 상단의 `알아두어야 할 단어`에 자주 들리는 단어, 뜻, 예문을 저장합니다.
8. 오른쪽 `스토리 메모`에 장면, 인물 관계, 다음에 기억할 내용을 적습니다.
9. 필요하면 뜻과 내 문장을 가볍게 덧붙입니다.
10. 저장된 카드에서 `원문 듣기`와 `내 문장 듣기`를 눌러 소리 내서 연습합니다.
11. 익숙해진 문장은 `연습 완료`로 체크합니다.
12. 검색으로 저장한 문장을 다시 찾을 수 있습니다.

모든 문장을 저장하려고 하지 않아도 됩니다. 한 번 플레이할 때 문장 3개면 충분하고, 긴 문장보다 내가 실제로 쓸 수 있는 짧은 문장이 좋습니다.

## ohmesh 데이터

로그인과 저장은 ohmesh를 사용합니다. 브라우저는 `ohmesh_session` HttpOnly 쿠키를 보내며, 앱 코드에서 토큰을 직접 다루지 않습니다.

- 앱 슬러그: `gamelingo`
- 저장 record type: `edith-finch-study-state`
- record data: `What Remains of Edith Finch`의 미션 체크, 단어장, 스토리 메모, 문장 노트

record data에는 대략 아래 정보가 저장됩니다.

```js
{
  wordMemo: "",
  vocabulary: [
    {
      id: "vocab-remember",
      word: "remember",
      meaning: "기억하다",
      gameExample: "I remember.",
      myExample: "I remember my first day at work."
    }
  ],
  storyMemo: "오늘은 Finch 가족과 집에 대한 기억을 따라갔다.",
  missionChecks: {
    "save-3-sentences": true,
    "save-5-words": true,
    "leave-story-note": true,
    "make-2-my-sentences": false,
    "speak-1-original": false,
    "practice-1-sentence": true
  },
  sentences: [
    {
      id: "sample-1",
      original: "I remember.",
      meaning: "나는 기억한다.",
      mySentence: "I remember my first day at work.",
      practiced: false
    }
  ]
}
```

데이터 구조가 깨진 경우에는 앱이 멈추지 않도록 기본 데이터로 되돌리는 처리를 넣었습니다.

## 다른 게임 추가 위치

대부분 [src/App.jsx](src/App.jsx) 안에서 수정하면 됩니다.

- `games` 배열에 새 게임 정보를 추가합니다.
- 새 게임용 기본 데이터와 ohmesh record type을 만듭니다.
- 게임별 `path`를 정해 고유 URL을 연결합니다.
- `App` 컴포넌트에서 현재 URL의 `path`에 따라 새 게임 페이지를 렌더링합니다.
- 게임마다 학습 방식이 다르면 `EdithFinchPage`처럼 별도 컴포넌트를 만들면 됩니다.
- 게임별 설명은 `edithFinchGuide`와 `GuideModal` 구조를 참고해 별도로 추가하면 됩니다.
