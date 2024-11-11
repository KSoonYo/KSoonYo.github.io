---
title: "[Javascript] SVG 태그의 <text>에서 말줄임표 구현하기"
date: "2024-10-28"
description: SVG 태그 <text>에서 말줄임표 구현 방법
category: Programming
subcategory: JavaScript
---

# TL;DR;

- svg의 **`<text>`** 태그에 말줄임표 스타일 속성(ellipsis) 적용이 안된다.
- 텍스트 전체 길이와 svg의 text 요소 너비를 계산하여 말줄임표 문자를 직접 추가해주면 말줄임표 효과를 적용할 수 있다.

# 서론

css 속성 중 **`text-overflow`** 의 **`ellipsis`** 을 이용하면, 텍스트가 너비를 벗어날 때 간단히 말줄임표 처리를 할 수 있습니다.

```html
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Text Overflow Ellipsis Example</title>
    <style>
      .container {
        width: 200px; /* 컨테이너 너비 설정 */
        border: 1px solid #ccc; /* 경계선 추가 */
        padding: 10px; /* 패딩 추가 */
        font-size: 16px; /* 글자 크기 설정 */
      }

      .ellipsis {
        margin: 0; /* 기본 여백 제거 */
        overflow: hidden; /* 넘치는 콘텐츠 숨기기 */
        white-space: nowrap; /* 텍스트를 한 줄로 제한 */
        text-overflow: ellipsis; /* 말줄임표를 추가 */
      }
    </style>
  </head>
  <body>
    <div class="container">
      <p class="ellipsis">
        말줄임표 표시 텍스트말줄임표 표시 텍스트말줄임표 표시 텍스트말줄임표
        표시 텍스트말줄임표 표시 텍스트말줄임표 표시 텍스트말줄임표 표시
        텍스트말줄임표 표시 텍스트말줄임표 표시 텍스트
      </p>
    </div>
  </body>
</html>
```

![exmaple_ellipsis](https://velog.velcdn.com/images/flashsoon/post/8852fd78-caaf-4d7c-ae0f-635198529457/image.png)

참고) https://developer.mozilla.org/en-US/docs/Web/CSS/text-overflow

위 코드를 svg의 text 요소를 사용한 것으로 수정하면 아래와 같습니다.

```html
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SVG Text Ellipsis Example</title>
    <style>
      svg {
        width: 200px; /* 컨테이너 너비 설정 */
        height: 40px;
        border: 1px solid #ccc; /* 경계선 추가 */
      }
      text {
        overflow: hidden; /* 넘치는 콘텐츠 숨기기 */
        white-space: nowrap; /* 텍스트를 한 줄로 제한 */
        text-overflow: ellipsis; /* 말줄임표를 추가 */
      }
    </style>
  </head>
  <body>
    <svg>
      <text x="0" y="20" font-size="16" fill="black">
        말줄임표 표시 텍스트말줄임표 표시 텍스트말줄임표 표시 텍스트말줄임표
        표시 텍스트말줄임표 표시 텍스트말줄임표 표시 텍스트말줄임표 표시
        텍스트말줄임표 표시 텍스트말줄임표 표시 텍스트
      </text>
    </svg>
  </body>
</html>
```

\*\*하지만 svg의 text 요소에는 말줄임표가 적용되지 않습니다.

![bad_example](https://velog.velcdn.com/images/flashsoon/post/572806a1-e755-4433-8769-a313ee9e0d7b/image.png)

\*\*svg 태그에 적용할 수 있는 css 속성은 `span`이나 `div` 처럼 일반적인 DOM 요소에 적용할 수 있는 속성과 차이가 있기 때문에 스타일 속성을 그대로 적용할 수 없습니다!

> ✨ ** svg 요소 별 css 속성 정리표** > https://css-tricks.com/svg-properties-and-css/

그래서 구글에 검색을 해보면 **`<text>`** 요소에 말줄임표 효과를 적용하기 위한 여러 글이 있는 것을 확인할 수 있습니다.

이번 글에서는 여러 방법 중 하나를 소개해보려고 합니다.
코드 예시는 Typescript로 작성했습니다.

# 설명

## 1. 함수 정의 및 매개변수

```typescript
async function trimTextToFitWidth(
  textElement: SVGTextElement,
  maxWidth: number,
  originText: string = ""
)
```

- 여러 `<text>` 요소에 대해 효율적으로 말줄임표 처리를 하기 위해 비동기 함수로 정의했습니다.
- `textElement` 가 바로 `<text>` 요소를 나타내는 매개변수를 의미합니다.
- `maxWidth`는 텍스트가 들어갈 수 있는 최대 너비입니다.

## 2. 변수 초기화

```typescript
let text = originText
const ellipsis = "···"
```

## 3. 텍스트 너비 체크 함수 정의

```typescript
const isTooWide = (str: string) => {
  textElement.textContent = str
  return textElement.getComputedTextLength() > maxWidth
}
```

- `getComputedTextLength()` 는 현재 텍스트의 너비를 반환합니다.
- 인자로 문자열을 받고 `textElement`의 컨텐츠로 할당 후에 최대 너비를 초과하는지 체크합니다.

## 4.🐱‍🏍(핵심) 이분 탐색을 통한 최적의 텍스트 길이 찾기

```typescript
let start = 0
let end = text.length
while (start < end) {
  let mid = Math.floor((start + end) / 2)
  if (isTooWide(text.slice(0, mid) + ellipsis)) {
    end = mid
  } else {
    start = mid + 1
  }
}
```

- 가장 핵심인 부분입니다.
- 알고리즘 문제 푸는 것도 아니고 무슨 이분 탐색인가 싶지만 textElement 내에서 최대한 자연스럽게 말줄임 스타일을 적용하기 위한 방법입니다.

- 여기서 수행하는 작업의 핵심은 3가지 입니다.
  (1) 텍스트의 가운데 길이에서 말줄임표 텍스트를 더한 문자열이 최대 너비를 초과하는지 체크합니다.
  (2-1) 초과한다면 **현재 텍스트를 절반으로 자르고, 뒤에 있는 문자열을 모두 버립니다.**(실제 원문 텍스트를 수정하는 것이 아님에 유의!)
  (2-2) 초과하지 않는다면 **최대한 textElement에 긴 텍스트를 쓰기 위해 시작점을 뒤로 하여 텍스트 요소 내의 마지막 끝 문자로 최대한 텍스트 뒤에 있는 문자를 선택**합니다.

그림으로 보면 매우 간단한 아이디어입니다.

![example_1](https://velog.velcdn.com/images/flashsoon/post/64944299-422e-47bd-93de-4e8e0f9339cd/image.png)

![example_2](https://velog.velcdn.com/images/flashsoon/post/dde07642-96f5-47df-a326-5d3d40345849/image.png)

![example_3](https://velog.velcdn.com/images/flashsoon/post/f5a90fba-a535-4b3b-adcf-ef2a00443275/image.png)

![example_4](https://velog.velcdn.com/images/flashsoon/post/c0c9f100-64ed-48f2-96e3-05447a1c3e2d/image.png)

![example_5](https://velog.velcdn.com/images/flashsoon/post/77812b42-a95b-4eb0-a25b-f9f7efaac115/image.png)

![example_6](https://velog.velcdn.com/images/flashsoon/post/e95e4c19-37fa-4429-b5a9-1e622c699c00/image.png)

![example_7](https://velog.velcdn.com/images/flashsoon/post/8ca46729-65d1-42ea-b6c7-3157c4235031/image.png)

![example_8](https://velog.velcdn.com/images/flashsoon/post/093dc1ed-be86-47f5-a167-d0443d5cca57/image.png)

## 5. 최종 텍스트 설정

```typescript
textElement.textContent = text.slice(0, start - 1) + ellipsis
```

# 전체 코드

```typescript
// text에 ellipsis 효과를 주기 위한 함수
async function trimTextToFitWidth(
  textElement: SVGTextElement,
  maxWidth: number,
  originText: string = ""
) {
  let text = originText
  const ellipsis = "···"

  const isTooWide = (str: string) => {
    textElement.textContent = str
    return textElement.getComputedTextLength() > maxWidth
  }

  // 텍스트가 maxWidth를 넘는지 check
  if (!isTooWide(text)) return

  // maxWidth 이내에 가장 끝 글자를 바이너리 서치로 탐색
  let start = 0
  let end = text.length
  while (start < end) {
    let mid = Math.floor((start + end) / 2)
    if (isTooWide(text.slice(0, mid) + ellipsis)) {
      end = mid
    } else {
      start = mid + 1
    }
  }

  // 가장 끝 글자를 지우고 말줄임표 추가
  textElement.textContent = text.slice(0, start - 1) + ellipsis
}
```

# 적용

이제 앞에서 말줄임표가 적용되지 않았던 코드에 적용해보겠습니다.

html 문서로 나타내기 위해 Typescript는 Javascript로 변환하여 적용하였습니다.

```html
<!DOCTYPE html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>SVG Text Overflow Ellipsis Example</title>
    <style>
      svg {
        width: 200px; /* 컨테이너 너비 설정 */
        border: 1px solid #ccc; /* 경계선 추가 */
        height: 40px; /* 컨테이너 높이 설정 */
        overflow: hidden; /* 넘치는 콘텐츠 숨기기 */
      }
    </style>
  </head>
  <body>
    <svg>
      <text id="myText" x="0" y="20" font-size="16" fill="black"></text>
    </svg>

    <script>
      // text에 ellipsis 효과를 주기 위한 함수
      async function trimTextToFitWidth(
        textElement,
        maxWidth,
        originText = ""
      ) {
        let text = originText
        const ellipsis = "···"

        const isTooWide = str => {
          textElement.textContent = str
          return textElement.getComputedTextLength() > maxWidth
        }

        // 텍스트가 maxWidth를 넘는지 check
        if (!isTooWide(text)) return

        // maxWidth 이내에 가장 끝 글자를 바이너리 서치로 탐색
        let start = 0
        let end = text.length
        while (start < end) {
          let mid = Math.floor((start + end) / 2)
          if (isTooWide(text.slice(0, mid) + ellipsis)) {
            end = mid
          } else {
            start = mid + 1
          }
        }

        // 가장 끝 글자를 지우고 말줄임표 추가
        textElement.textContent = text.slice(0, start - 1) + ellipsis
      }

      // 텍스트 설정 및 함수 호출
      const textElement = document.getElementById("myText")
      const originalText =
        "말줄임표 표시 텍스트말줄임표 표시 텍스트말줄임표 표시 텍스트말줄임표 표시 텍스트말줄임표 표시 텍스트말줄임표 표시 텍스트말줄임표 표시 텍스트"

      // 최대 너비를 설정하고 함수 호출
      const maxWidth = 200 // 컨테이너 너비
      trimTextToFitWidth(textElement, maxWidth, originalText)
    </script>
  </body>
</html>
```

**결과**

![svg-text-ellipsis-good-example](https://velog.velcdn.com/images/flashsoon/post/969fe767-a50d-4646-a7f0-ac53ea6abc3b/image.png)

물론 **`ellipsis`**를 다른 문자로 변경하는 것도 가능합니다.
**`trimTextToFitWidth`** 함수 내에서 **`ellipsis 변수` **초기화하는 부분을 `'...'`로 변경해보겠습니다.

```javascript
const ellipsis = "..."
```

**결과**

![svg-text-ellipsis-good-example-v2](https://velog.velcdn.com/images/flashsoon/post/7220d794-6753-4222-ba86-1df7484654c8/image.png)
