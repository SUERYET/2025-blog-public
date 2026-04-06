从「核心思想」→「排列/组合的区别」→「代码模板」→「易错点」角度出发，解决这类回溯问题.

---

## 一、核心底层逻辑：回溯DFS的本质

所有排列、组合问题，本质都是**「暴力枚举所有可能，用回溯剪枝/恢复状态」**：

1. **状态定义**：用`pos`表示当前选到第几个位置，用`StringBuilder`/数组存当前已经选好的序列
    
2. **递归终止**：当`pos == 目标长度k`时，输出结果并返回
    
3. **递归过程**：遍历所有可选的数字，「选一个 → 递归下一层 → 回溯（撤销选择）」
    
4. **核心区别**：排列和组合的差异，只在于「能不能重复选」「要不要按顺序」「要不要标记已选」
    

---

## 二、排列问题（Permutation）

### 1. 问题定义

从`n`个元素中选出`k`个，**顺序不同算不同方案**，分两种常见场景：

- 场景1：**可重复选**（比如密码锁、可重复排列）
    
- 场景2：**不可重复选**（全排列、无重复排列）
    

### 2. 场景1：可重复选的排列（最基础）

#### 问题示例

输入`n=3, k=2`，输出所有长度为2的序列，数字1~3可重复：

```Plain
1 1
1 2
1 3
2 1
2 2
2 3
3 1
3 2
3 3
```

#### 核心思路

- 不需要标记数组，每个位置都可以选1~n的所有数字
    
- 递归时直接遍历`i=1~n`，选完回溯即可
    

#### Java代码模板

```java
import java.util.Scanner;  

public class PermutationRepeat {  
    static int n, k;  
    public static void main(String[] args) {  
        Scanner sc = new Scanner(System.in);  
        n = sc.nextInt();  
        k = sc.nextInt();  
        dfs(0, new StringBuilder());  
    }  

    // pos: 当前选到第pos个位置（从0开始）
    private static void dfs(int pos, StringBuilder sb) {
        // 终止条件：选够k个，输出
        if (pos == k) {
            System.out.println(sb.toString().trim());
            return;
        }

        // 遍历所有可选数字（1~n）
        for (int i = 1; i <= n; i++) {
            String num = i + " ";
            sb.append(num); // 1. 做选择：把i加入当前序列
            dfs(pos + 1, sb); // 2. 递归：选下一个位置
            // 3. 回溯：撤销选择，恢复状态
            sb.delete(sb.length() - num.length(), sb.length());
        }
    }
}
```

---

### 3. 场景2：不可重复选的排列（全排列）

#### 问题示例

输入`n=3, k=2`，输出所有长度为2的无重复序列：

```Plain
1 2
1 3
2 1
2 3
3 1
3 2
```

#### 核心思路

- 新增`boolean[] used`数组，标记数字是否已经被选过
    
- 选数字前先判断`if (!used[i])`，选完标记`used[i]=true`，回溯时恢复`used[i]=false`
    

#### Java代码模板

```java
import java.util.Scanner;

public class PermutationNoRepeat {
    static int n, k;
    static boolean[] used; // 标记数字是否已被选

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        n = sc.nextInt();
        k = sc.nextInt();
        used = new boolean[n + 1]; // 数字1~n，索引0不用
        dfs(0, new StringBuilder());
    }

    private static void dfs(int pos, StringBuilder sb) {
        if (pos == k) {
            System.out.println(sb.toString().trim());
            return;
        }

        for (int i = 1; i <= n; i++) {
            if (used[i]) continue; // 剪枝：已经选过的数字跳过
            used[i] = true; // 标记为已选

            String num = i + " ";
            sb.append(num);
            dfs(pos + 1, sb);
            sb.delete(sb.length() - num.length(), sb.length()); // 回溯字符串

            used[i] = false; // 回溯：恢复未选状态
        }
    }
}
```

全排列（k=n）直接用这个模板，把k改成n即可。

---

## 三、组合问题（Combination）

### 1. 问题定义

从`n`个元素中选出`k`个，**顺序不同算同一种方案**，只按「升序/固定顺序」输出，避免重复。

#### 问题示例

输入`n=3, k=2`，输出所有组合：

```Plain
1 2
1 3
2 3
```

### 2. 核心思路

- 关键优化：**用「起始索引start」限制遍历范围**，保证「后面选的数字一定比前面大」，从根源上避免重复
    
- 不需要`used`数组，用`start`剪枝，时间复杂度远低于排列
    
- 比如选了`1`之后，下一层只能从`2`开始遍历，永远不会出现`2 1`这种逆序
    

### 3. Java代码模板

```java
import java.util.Scanner;

public class Combination {
    static int n, k;
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        n = sc.nextInt();
        k = sc.nextInt();
        dfs(0, new StringBuilder(), 1); // start从1开始，保证升序
    }

    /**
     * @param pos 当前选到第pos个位置
     * @param sb 当前序列
     * @param start 下一层只能从start开始选，避免重复
     */
    private static void dfs(int pos, StringBuilder sb, int start) {
        if (pos == k) {
            System.out.println(sb.toString().trim());
            return;
        }

        // 优化：i的上限可以改成 n - (k - pos) + 1，提前剪枝
        for (int i = start; i <= n; i++) {
            String num = i + " ";
            sb.append(num);
            dfs(pos + 1, sb, i + 1); // 下一层从i+1开始，保证后面的数更大
            sb.delete(sb.length() - num.length(), sb.length()); // 回溯
        }
    }
}
```

### 4. 进阶优化：提前剪枝（提升效率）

当剩余可选数字 < 还需要选的数字时，直接跳过，避免无效递归：

```Java
// 把for循环的i上限改成：n - (k - pos) + 1
for (int i = start; i <= n - (k - pos) + 1; i++)
```

- 原理：当前已经选了`pos`个，还需要选`k-pos`个，所以`i`最多到`n - (k-pos) + 1`，否则后面不够选
    
- 比如`n=5, k=3`，当前`pos=1`（已经选了1个），还需要选2个，`i`最多到`5-2+1=4`，`i=5`时后面不够2个，直接跳过
    

---

## 四、排列 vs 组合：核心区别对照表

| 特性    | 排列问题            | 组合问题                 |
| ----- | --------------- | -------------------- |
| 顺序要求  | 顺序不同算不同方案       | 顺序不同算同一种方案           |
| 核心限制  | 用`used`数组避免重复选  | 用`start`索引保证升序，从根源去重 |
| 时间复杂度 | O(n! / (n-k)!)  | O(C(n,k))，远低于排列      |
| 递归参数  | `pos, sb, used` | `pos, sb, start`     |
| 遍历起点  | 每次从`1`开始        | 每次从`start`（上一个数+1）开始 |
| 典型场景  | 全排列、密码、排队顺序     | 选小组、组合数、子集           |

---

## 五、回溯DFS的通用易错点（必看）

### 1. 递归参数错误：`pos++` vs `pos+1`

❌ 错误写法：`dfs(pos++, sb)` → 先传值再自增，永远传同一个pos，无限递归卡死

✅ 正确写法：`dfs(pos + 1, sb)` → 直接传+1后的值，递归下一层

### 2. 回溯不彻底：字符串删除错误

❌ 错误写法：`sb.deleteCharAt(sb.length()-1)` 连续删两次 → 数字是两位数时直接越界

✅ 正确写法：`sb.delete(sb.length() - str.length(), sb.length())` → 加了多长，就删多长，通用安全

### 3. 组合问题漏加`start`

❌ 错误：组合用了排列的遍历方式，导致出现`2 1`这种重复方案

✅ 正确：用`start`限制遍历起点，保证序列严格升序，从根源去重

### 4. 排列问题漏加`used`回溯

❌ 错误：选完数字后没把`used[i]`改回`false`，导致后面的递归无法选这个数字

✅ 正确：递归返回后，必须同步回溯`used`数组，恢复初始状态

---

## 六、举一反三：其他常见变种

### 1. 子集问题（最开始的合唱题）

- 本质：组合的特殊情况，k从0到n的所有组合
    
- 思路：递归时每个位置可以选`N`（不选）或`Y`（选），天然按字典序输出
    
- 代码就是你最开始的合唱题解法，核心是「先N后Y」保证字典序
    

### 2. 带重复元素的排列/组合

- 排列：先排序，再用`if (i>start && nums[i]==nums[i-1]) continue`去重
    
- 组合：同样先排序，用相同的剪枝逻辑避免重复
    

---

## 七、一句话总结

- **排列**：顺序敏感，用`used`数组防重复，每个位置从头遍历
    
- **组合**：顺序不敏感，用`start`索引防重复，每个位置从上次的下一个开始
    
- **回溯的核心**：「做选择 → 递归 → 撤销选择」，三个步骤缺一不可
    
