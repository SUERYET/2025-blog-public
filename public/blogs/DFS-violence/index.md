蓝桥杯里**DFS 暴力就是骗分神器**，不会正解没关系，只要能暴力枚举所有情况，至少能拿 30%~70% 分。

**通用模板 + 适用题型 + 直接能套的 Java 代码**。

---

# 一、什么时候用 DFS 暴力骗分？

看到这些题直接无脑 DFS：

- 组合、选择问题（选/不选）
    
- 排列问题（全排列、顺序不同算不同）
    
- 路径问题（走格子、迷宫）
    
- 子集问题、分配问题（给背包分配物品）
    
- 数据范围很小的题（n ≤ 20、25、30）
    

骗分口诀：

**数据小 → DFS

能选或不选 → DFS

不会做 → 先 DFS 拿分再说**

---

# 二、DFS 暴力通用结构

```java
// 全局变量存答案、输入数据
static int ans = 0;
static int[] a;
static int n, target;

public static void dfs(当前位置, 当前状态) {
    // 1. 递归出口
    if (到达终点) {
        更新答案;
        return;
    }

    // 2. 枚举所有可能选择
    for (所有可能选项) {
        if (该选项合法) {
            选它;
            dfs(下一个位置, 新状态);
            撤销选择（回溯）;
        }
    }
}
```

---

# 三、最常用 3 类 DFS 骗分模板

## 模板1：选 / 不选模型（背包、子集、最大最小值）

适用：背包问题、子集和、是否能凑出某个数

```java
static int maxSum = 0;
static int[] w;
static int n, cap;

// index：处理第几个物品，sum：当前总重量
static void dfs(int index, int sum) {
    // 出口：所有物品选完
    if (index == n) {
        if (sum <= cap) maxSum = Math.max(maxSum, sum);
        return;
    }

    // 不选第 index 个
    dfs(index + 1, sum);

    // 选第 index 个
    dfs(index + 1, sum + w[index]);
}
```

---

## 模板2：排列模型（全排列、顺序问题）

适用：数字排列、路径顺序、算式填符号

```java
static int[] a;
static boolean[] vis;
static int n, ans;

static void dfs(int step) {
    if (step == n) {
        // 统计答案
        ans++;
        return;
    }

    for (int i = 0; i < n; i++) {
        if (!vis[i]) {
            vis[i] = true;
            dfs(step + 1);
            vis[i] = false; // 回溯
        }
    }
}
```

---

## 模板3：分配模型（给多个背包分配、多组选择）

适用：你刚才那道**三个背包**的题、分配问题

```java
static long[] bag; // 背包容量
static long va, vb;
static int cntA, cntB;
static int max = 0;

// a：用了几个A，b：用了几个B
static void dfs(int a, int b) {
    max = Math.max(max, a + b);

    // 还能选A
    if (a < cntA) {
        // 尝试放进任意背包，只要放得下
        for (int i = 0; i < 3; i++) {
            if (bag[i] >= va) {
                bag[i] -= va;
                dfs(a + 1, b);
                bag[i] += va; // 回溯
            }
        }
    }

    // 还能选B
    if (b < cntB) {
        for (int i = 0; i < 3; i++) {
            if (bag[i] >= vb) {
                bag[i] -= vb;
                dfs(a, b + 1);
                bag[i] += vb;
            }
        }
    }
}
```

---

# 四、蓝桥杯骗分关键技巧

## 1. 能暴力绝不优化

- n ≤ 20 → 2^20 = 1e6 随便跑
    
- n ≤ 25 → 2^25 = 3e7 也能过
    
- n ≤ 30 → 2^30 = 1e9 会超时，但**小数据点照样拿分**
    

## 2. 不会正解没关系，暴力能拿部分分

蓝桥杯是**按测试点给分**，你写暴力至少能拿：

- 小样例：100%
    
- 中样例：50%
    
- 大样例：0，但总分已经很赚
    

## 3. 全局变量比传参更不容易错

DFS 里尽量用：

- 全局数组
    
- 全局 vis[]
    
- 全局 ans
    

少传参，少出错，骗分更稳。

## 4. 回溯一定要还原

```Java
选 → 做修改 → dfs → 撤销修改
```

忘记撤销 = 直接 WA

---

# 五、刚才那道背包题，用 DFS 暴力怎么写？
[题目链接](https://www.luogu.com.cn/problem/P12210)
这就是**纯暴力不合并背包**的骗分代码，一定能拿高分：

```java
import java.util.Scanner;

public class Main {
    static long[] bag = new long[3];
    static long va, vb;
    static int cntA, cntB;
    static int ans;

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int T = sc.nextInt();
        while (T-- > 0) {
            bag[0] = sc.nextLong();
            bag[1] = sc.nextLong();
            bag[2] = sc.nextLong();
            cntA = sc.nextInt();
            cntB = sc.nextInt();
            va = sc.nextLong();
            vb = sc.nextLong();
            ans = 0;
            dfs(0, 0);
            System.out.println(ans);
        }
    }

    static void dfs(int a, int b) {
        ans = Math.max(ans, a + b);

        // 放 A
        if (a < cntA) {
            for (int i = 0; i < 3; i++) {
                if (bag[i] >= va) {
                    bag[i] -= va;
                    dfs(a + 1, b);
                    bag[i] += va;
                }
            }
        }

        // 放 B
        if (b < cntB) {
            for (int i = 0; i < 3; i++) {
                if (bag[i] >= vb) {
                    bag[i] -= vb;
                    dfs(a, b + 1);
                    bag[i] += vb;
                }
            }
        }
    }
}
```

---

# 六、一句话总结蓝桥杯 DFS 骗分

1. **不会做就 DFS**
    
2. 枚举所有可能选择
    
3. 用 vis 或直接修改+回溯
    
4. 全局变量存答案
    
5. 小数据点必拿分，大数据点看运气
    
