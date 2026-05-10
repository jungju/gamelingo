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

1. 왼쪽 `게임 선택`에서 `What Remains of Edith Finch`를 선택합니다.
2. 상단의 `사용 방법 보기`를 누르면 선택한 게임에 맞는 설명 팝업이 열립니다.
3. `이번 플레이 미션`에서 이번 플레이 때 챙길 작은 목표를 체크합니다.
4. `플레이 진행`에서 현재 챕터, 현재 위치 메모, 다음에 이어할 내용을 적습니다.
5. 챕터를 끝내면 `챕터 완료 체크`에서 해당 챕터를 체크합니다.
6. 게임 중 짧은 영어 문장을 발견하면 `문장 추가`에 원문을 그대로 입력합니다.
7. 난이도와 감정 태그를 붙이고, 같은 구조로 내 상황에 맞는 문장을 만듭니다.
8. 저장된 카드에서 `원문 듣기`와 `내 문장 듣기`를 눌러 소리 내서 연습합니다.
9. 익숙해진 문장은 `연습 완료`로 체크합니다.
10. 검색과 챕터 필터로 저장한 문장을 다시 찾을 수 있습니다.

모든 문장을 저장하려고 하지 않아도 됩니다. 한 번 플레이할 때 문장 3개면 충분하고, 긴 문장보다 내가 실제로 쓸 수 있는 짧은 문장이 좋습니다.

## localStorage 데이터

서버나 DB 없이 브라우저 `localStorage`에 저장합니다.

- `gamelingo:v1:selectedGame`: 현재 선택한 게임 id
- `gamelingo:v1:edithFinch`: `What Remains of Edith Finch`의 진행 정보와 문장 노트

`gamelingo:v1:edithFinch`에는 대략 아래 정보가 저장됩니다.

```js
{
  currentChapter: "Prologue",
  currentLocation: "",
  nextPlayNote: "",
  completedChapters: ["Prologue"],
  missionChecks: {
    "save-3-sentences": true,
    "make-2-my-sentences": false,
    "speak-1-original": false,
    "leave-next-note": true
  },
  sentences: [
    {
      id: "sample-1",
      chapter: "Prologue",
      original: "I remember.",
      meaning: "나는 기억한다.",
      mySentence: "I remember my first day at work.",
      memo: "remember 뒤에 기억나는 대상을 붙여서 연습",
      difficulty: "Easy",
      emotionTag: "기억",
      practiced: false
    }
  ]
}
```

데이터 구조가 깨진 경우에는 앱이 멈추지 않도록 기본 데이터로 되돌리는 처리를 넣었습니다.

## 다른 게임 추가 위치

대부분 [src/App.jsx](src/App.jsx) 안에서 수정하면 됩니다.

- `games` 배열에 새 게임 정보를 추가합니다.
- 새 게임용 기본 데이터와 localStorage key를 만듭니다.
- `App` 컴포넌트에서 `selectedGame`에 따라 새 게임 페이지를 렌더링합니다.
- 게임마다 학습 방식이 다르면 `EdithFinchPage`처럼 별도 컴포넌트를 만들면 됩니다.
- 게임별 설명은 `edithFinchGuide`와 `GuideModal` 구조를 참고해 별도로 추가하면 됩니다.
