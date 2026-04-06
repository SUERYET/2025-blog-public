还有4天冲**蓝桥杯 Java B 组**，**别刷难题、别学新算法**，核心策略只有一个：

**抓稳前70%基础分 + 练会暴力骗分 + 背熟Java高频模板 + 避开语法坑**

蓝桥杯Java B组的分数分布极友好：**前6道题是送分/中档题，占70%+分数**，后两道难题直接暴力骗分即可。下面是**4天精准冲刺计划**，完全贴合Java B组考点，每天按流程刷就行。

# 核心前提（必记）

1. 放弃：复杂DP、高级图论（网络流、最短路优化）、复杂数学（莫比乌斯等）
    
2. 死磕：**模拟、暴力DFS、枚举、贪心、简单DP、二分、数论基础**
    
3. 必练：Java输入输出（快读）、long溢出、集合迭代器、字符串处理
    
4. 骗分：不会做就DFS/暴力枚举，能过小样例就有分
    

---

# 4天精准冲刺刷题计划

## 第1天：基础送分题全拿下（填空+前3道编程）

### 刷题目标

搞定**模拟、字符串、数学计算、枚举**，这部分占**30%分数**，必须100%拿满。

### 必刷题型（直接搜题刷）

1. 字符串处理：回文、子串、反转、替换（蓝桥杯填空高频）
    
2. 基础枚举：日期问题、数字统计、循环枚举
    
3. Java语法题：迭代器、集合、输入输出、数组操作
    
4. 简单数学：最大公约数、最小公倍数、质数判断、阶乘
    

### 刷题平台

- 洛谷：【蓝桥杯真题】简单模拟专题
    
- AcWing：蓝桥杯Java B组基础题
    

### 必背模板

- 快读模板（解决Scanner大数据超时）
    
- 回文判断双指针
    
- 质数判断
    
- 日期计算
    

## 第2天：暴力DFS+贪心（中档题核心，拿30%分）

### 刷题目标

搞定**DFS回溯、选/不选模型、贪心**，对应蓝桥杯第4-5题，是拉分关键。

### 必刷题型

1. DFS暴力：全排列、子集和、迷宫、分配问题（你之前的背包题）
    
2. 贪心：区间调度、最优装载、简单贪心选择
    
3. 暴力枚举：三重循环、排列组合
    

### 核心技巧

- DFS选/不选模板（背死，不会做就套）
    
- 回溯必须还原状态
    
- 多背包/分配问题直接暴力DFS骗分
    

### 刷题清单

- 洛谷：DFS入门10题
    
- 蓝桥杯真题：\[分巧克力\]\[背包问题]\[全排列\]
    

## 第3天：简单DP+二分+数论（中档压轴，拿15%分）

### 刷题目标

搞定**最简单的DP、二分查找、基础数论**，对应第6题，能做就做，做不了暴力骗分。

### 必刷题型

1. 简单DP：斐波那契、爬楼梯、最大子数组和
    
2. 二分查找：二分答案、查找元素、边界判断
    
3. 数论：快速幂、因数个数、余数问题
    

### 必背模板

- 二分查找左右边界
    
- 爬楼梯DP模板
    
- 快速幂模板
    

### 放弃提醒

复杂DP（背包DP进阶、区间DP）直接跳过，暴力枚举小样例即可。

## 第4天：真题套卷模拟+复盘+骗分总结

### 刷题目标

**练考场手感、查漏补缺、固化模板**，不做新题，只复盘。

### 任务

1. 刷**1套近3年Java B组真题**（严格计时4小时）
    
2. 只改错题，不抠难题
    
3. 默写所有背过的模板（DFS、快读、二分、回文）
    
4. 熟记考场骗分技巧
    

---

# 蓝桥杯Java B组 必背万能模板（直接复制）

## 1. 快读模板（解决Scanner超时，必背）

```java
import java.io.*;
public class Main {
    static BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
    static StringTokenizer st;
    static int nextInt() throws IOException {
        while(st == null || !st.hasMoreTokens())
            st = new StringTokenizer(br.readLine());
        return Integer.parseInt(st.nextToken());
    }
    static long nextLong() throws IOException {
        while(st == null || !st.hasMoreTokens())
            st = new StringTokenizer(br.readLine());
        return Long.parseLong(st.nextToken());
    }
    public static void main(String[] args) throws IOException {
        int n = nextInt();
        // 代码
    }
}
```

## 2. DFS暴力选/不选模板（骗分神器）

```java
static int ans = 0;
static int[] w;
static int n, cap;
static void dfs(int idx, int sum) {
    if(idx == n) {
        ans = Math.max(ans, sum);
        return;
    }
    dfs(idx+1, sum); // 不选
    if(sum + w[idx] <= cap) dfs(idx+1, sum + w[idx]); // 选
}
```

## 3. 二分查找模板

```java
static int binarySearch(int[] a, int target) {
    int l = 0, r = a.length-1;
    while(l <= r) {
        int mid = (l + r) / 2;
        if(a[mid] == target) return mid;
        else if(a[mid] < target) l = mid + 1;
        else r = mid - 1;
    }
    return -1;
}
```

## 4. 回文判断双指针

```java
static boolean isPalindrome(String s) {
    int i = 0, j = s.length()-1;
    while(i < j) {
        if(s.charAt(i) != s.charAt(j)) return false;
        i++; j--;
    }
    return true;
}
```

---

# 考场急救骗分技巧（4天必学）

1. **不会做就暴力枚举**
    

2. 循环层数多一点，能过小样例就有分，蓝桥杯按测试点给分。
    

3. **DFS无脑套**
    

4. 排列、分配、选择问题，直接DFS，不用想优化。
    

5. **大数一律用long**
    

6. 容量、乘积、总和全用long，避免int溢出（90% WA的原因）。
    

7. **填空题不会就猜**
    

8. 日期题猜中间数，数字题猜倍数、质数。
    

9. **编程题输出样例**
    

10. 完全不会写，直接硬编码输出样例答案，至少拿10%分。
    

---

# Java专属避坑点（必看，少丢20分）

1. **Scanner读取慢**：大数据用快读模板
    
2. **int溢出**：1e9相关计算必须用long
    
3. **字符串比较**：用equals()，不用==
    
4. **集合遍历删除**：用迭代器remove()，不用集合自带remove()
    
5. **递归深度**：DFS别太深，蓝桥杯栈空间小，深搜改迭代
    

---

# 最后一句话

4天冲刺**不求满分，只求稳拿前70%分**，暴力骗分+基础题全对，Java B组省二稳拿，冲省一完全够。

按计划刷，别慌，蓝桥杯暴力就是王道！