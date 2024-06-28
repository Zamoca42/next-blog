---
title: "사이드바 정렬 개선하기"
description: "폴더, 파일을 문자열 정렬에서 개선해보자"
tag:
  - Node.js
  - TypeScript
  - Next.js
---

블로그의 사이드바에서 현재 포스트가 가지고 있는 카테고리 폴더와 파일을 보여주려고 컴포넌트를 만들었는데,
정렬 방식이 마음에 들지 않았다.

이를 개선하기 위해 두 가지 목표를 설정했다.

1. 숫자를 포함한 정렬 방식으로 변경
2. 폴더를 파일보다 상위에 배치

![자바스크립트 문자열 방식으로 정렬하고 폴더와 파일의 구분이 없다.](https://github.com/Zamoca42/next-blog/assets/96982072/3743a624-545c-48c5-b341-342a722d8a97)

<!-- end -->

## 자바스크립트의 정렬 방식

자바스크립트는 기본적으로 사전식(Lexicographic) 정렬을 사용한다.
이는 문자열을 기준으로 정렬이 이루어지며, 숫자도 문자열로 취급되어 비교된다.

![deepdive 폴더 내부의 포스트를 가져온 결과](https://github.com/Zamoca42/next-blog/assets/96982072/83beaaaa-c876-45a1-9a83-44fd82a50139)

이러한 정렬 방식은 의도한 순서와 맞지 않아 개선이 필요했다.

## sort와 localeCompare 사용

숫자가 포함된 파일 이름을 올바르게 정렬하기 위해 `sort` 메서드와 `localeCompare`의 `numeric` 옵션을 사용했다.

```javascript
const mixedArray = ["item10", "item2", "item1", "item22", "item13", "item3"];

const sortedByLocaleCompare = [...mixedArray].sort((a, b) => {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
});
```

이 방식을 사용하면 1, 2, 3, 10, 13, 22 순으로 정렬된다.

`sensitivity` 옵션은 문자열 비교 시 대소문자나 발음 구별 부호(예: 악센트)를 어떻게 처리할지 지정한다.

이 옵션에는 네 가지 값이 있다.

- `"base"`: 기본 문자만 비교. 대소문자와 발음 구별 부호를 무시. (예: "a" = "A" = "à")
- `"accent"`: 기본 문자와 발음 구별 부호를 비교하지만 대소문자는 무시. (예: "a" = "A", "a" ≠ "à")
- `"case"`: 기본 문자와 대소문자를 비교하지만 발음 구별 부호는 무시. (예: "a" ≠ "A", "a" = "à")
- `"variant"`: 기본 문자, 발음 구별 부호, 대소문자를 모두 구별하여 비교. (예: "a" ≠ "A" ≠ "à")

이 예제에서는 `"base"`를 사용하여 대소문자와 발음 구별 부호를 무시하고 정렬했다.
만약 대소문자를 구분하여 정렬하고 싶다면 `"variant"`를 사용할 수 있다.

## 사이드바에 적용

`localeCompare`를 사용하여 컨텐츠 폴더의 파일들을 정렬했다.

```diff-javascript:tree-util.ts
const getTreeNode = async (
  directory: string,
  parentId: string = ""
 ): Promise<ContentFolder[]> => {
   try {
     const fileNames = await fs.readdir(directory);
     const gitInfo = await readGitInfo();

+    fileNames.sort((a, b) =>
+      a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
+    );

     // ... 나머지 코드 ...
   } catch (error) {
     console.error(`Error getting tree node for directory ${directory}:`, error);
     return [];
   }
 };
```

![console.log를 확인하면 순서대로 정렬이 되었다.](https://github.com/Zamoca42/next-blog/assets/96982072/d6396dcb-c071-4980-aa36-99101671478f)

![사이드바에도 포스트가 순서대로 정렬되었다.](https://github.com/Zamoca42/next-blog/assets/96982072/ae0d6831-fc2f-4268-894e-1815df8362bb)

## 폴더를 상위로 이동시킨 정렬

그 다음은 포스트와 폴더가 무작위로 보여주고 있는 사이드바를 폴더 - 포스트 순으로 정렬이 필요했다.
클라이언트에서 정렬할지, 서버에서 정렬할지 두 가지 방법이 있는데 일단 하나씩 적용 해보고 선택하기로 했다.

### 1. 클라이언트 컴포넌트에서 정렬

children의 length가 truthy하면 폴더로 판단하고 배열의 앞으로 이동시킨다.

```tsx:sidebar.tsx
type Props = {
  toc: TocItem[];
  folders: ContentFolder[];
};

const sortFoldersAndFiles = (
  items: ContentFolder[]
): ContentFolder[] => {
  return items.sort((a, b) => {
    if (
      (a.children?.length && b.children?.length) ||
      (!a.children?.length && !b.children?.length)
    ) {
      return a.name.localeCompare(b.name);
    }
    if (a.children?.length && !b.children?.length) {
      return -1;
    }
    return 1;
  });
};

export const SideBar = ({ toc, folders }: Props) => {
  const { isOpen, setIsOpen } = useSideBar();
  const [sortedFolders, setSortedFolders] = useState<ContentFolder[]>([]);
  const pathname = usePathname();
  const sorted = sortFoldersAndFiles(folders);

  return (
    <aside className="h-full z-0">
      {/* 나머지 코드 */}
          <Tree
            className="w-full max-h-screen bg-background text-muted-foreground"
            indicator={true}
            initialExpendedItems={pathname.split("/").slice(1)}
          >
            {sorted.map((element) => (
              <TreeItem key={element.id} elements={[element]} toc={toc} />
            ))}
          </Tree>
      {/* 나머지 코드 */}
    </aside>
  );
};
```

### 2. Node.js에서 정렬

폴더와 파일을 구분하여 정렬하기 위해 Node.js의 `readdir` 옵션 중 `withFileTypes`를 사용했다.

```diff-typescript
const getTreeNode = async (
  directory: string,
  parentId: string = ""
): Promise<ContentFolder[]> => {
  try {
-   const fileNames = await fs.readdir(directory);
+   const dirents = await fs.readdir(directory, { withFileTypes: true });
    const gitInfo = await readGitInfo();

+   dirents.sort((a, b) => {
+     if (a.isDirectory() && !b.isDirectory()) return -1;
+     if (!a.isDirectory() && b.isDirectory()) return 1;
      return a.name.localeCompare(b.name, undefined, {
        numeric: true,
        sensitivity: "base",
      });
    });
    // ... 나머지 코드 ...
```

이 방식을 사용하면 [`Dirent`](https://nodejs.org/dist/latest-v10.x/docs/api/fs.html#fs_class_fs_dirent)
객체를 통해 폴더와 파일을 쉽게 구분할 수 있다.

## 클라이언트 측 정렬 vs 서버 측 정렬

정렬 로직을 구현할 때 클라이언트 측과 서버 측 중 어디에서 수행할지 결정하기 위해

두 방식의 장단점을 비교해봤다.

### 클라이언트 측 정렬

**장점:**

1. 서버 부하 감소: 정렬 작업을 클라이언트에서 수행하므로 서버의 부하가 줄어든다.
2. 동적 정렬: 사용자의 상호작용에 따라 즉시 재정렬이 가능.
3. 네트워크 트래픽 감소: 정렬되지 않은 데이터만 전송받으므로 데이터 전송량이 감소.

**단점:**

1. 클라이언트 리소스 사용: 브라우저의 CPU와 메모리를 사용하므로 클라이언트 성능에 영향.
2. 대량 데이터 처리의 어려움: 큰 데이터셋의 경우 클라이언트에서 처리하기 어려움.
3. 초기 렌더링 지연: 데이터를 받은 후 정렬하므로 초기 화면 표시가 지연.

### 서버 측 정렬

**장점:**

1. 클라이언트 부하 감소: 정렬된 데이터를 받아 바로 표시할 수 있어 클라이언트의 작업이 줄어듬.
2. 대량 데이터 처리 용이: 서버의 리소스를 활용해 큰 데이터셋도 효율적으로 처리.
3. 일관된 정렬 결과: 모든 클라이언트에게 동일한 정렬 결과를 제공.

**단점:**

1. 유연성 감소: 정렬 기준을 변경하려면 서버에 추가 요청.
2. 서버 부하 증가: 정렬 작업이 서버에서 이루어져 서버의 계산 부담이 증가.
3. 추가 개발 필요: 서버 측 API에 정렬 로직을 구현.

## 마무리

![처음과 비교 - 위의 두 가지 방법 모두 같은 결과를 확인할 수 있다.](https://github.com/Zamoca42/next-blog/assets/96982072/3c41a1f4-cabb-488a-b5f8-743fda3316bb)

사이드바에서는 서버 사이드에서 정렬하기로 결정했다.

서버 사이드에서 정렬하는게 클라이언트의 리소스 사용을 최소화하고 코드의 가독성에 판단했다.  
또한, Next.js의 서버 사이드 렌더링 특성과도 잘 맞아 초기 로딩 성능을 개선할 수 있었다.

전체 소스코드는
[GitHub 레포지토리](https://github.com/Zamoca42/next-blog/blob/develop/src/lib/tree-util.ts)에서 확인할 수 있다.
