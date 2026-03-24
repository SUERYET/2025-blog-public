#数组 #前缀和数组 
### 参见:
[前缀和数组](https://labuladong.online/zh/algo/data-structure/prefix-sum/)
### 概念:
前缀和技巧适用于快速、频繁地计算一个索引区间内的元素之和。
# 一维数组的前缀和
### 例题:
[leetcode303-区域和检索 - 数组不可变](https://leetcode.cn/problems/range-sum-query-immutable/)

高效做法\[时间复杂度为O(1)\]:
```java
class NumArray {
    // 前缀和数组
    private int[] preSum;

    // 输入一个数组，构造前缀和
    public NumArray(int[] nums) {
        // preSum[0] = 0，便于计算累加和
        preSum = new int[nums.length + 1];
        // 计算 nums 的累加和
        for (int i = 1; i < preSum.length; i++) {
            preSum[i] = preSum[i - 1] + nums[i - 1];
        }
    }

    // 查询闭区间 [left, right] 的累加和
    public int sumRange(int left, int right) {
        return preSum[right + 1] - preSum[left];
    }
}
```
算法示意图:
### 核心思路:
我们 new 一个新的数组 `preSum` 出来，`preSum[i]` 记录 `nums[0..i-1]` 的累加和，看图 10=3+5+2：
看这个 `preSum` 数组，如果我想求索引区间 `[1, 4]` 内的所有元素之和，就可以通过 `preSum[5] - preSum[1]` 得出。
这样，`sumRange` 函数仅仅需要做一次减法运算，避免了每次进行 for 循环调用，最坏时间复杂度为常数 O(1)。
![](/blogs/prefix-sum/aa0cb96260cac82a.png)
eg. preSum\[1] = nums\[0] + nums\[1]
preSum\[2] = nums\[0] + nums\[1] + nums\[2]
___

# 二维数组的前缀和
### 例题:
[leetcode304-二维区域和检索 - 矩阵不可变](https://leetcode.cn/problems/range-sum-query-2d-immutable/)

## 思路:
任意子矩阵的元素和可以转化成它周边几个大矩阵的元素和的运算：
![](/blogs/prefix-sum/9649f0524c4ef5ff.png)
### 高效做法:
```java
class NumMatrix {
    // preSum[i][j] 记录矩阵 [0, 0, i-1, j-1] 的元素和
    private int[][] preSum;

    public NumMatrix(int[][] matrix) {
        int m = matrix.length, n = matrix[0].length;
        if (m == 0 || n == 0) return;
        // 构造前缀和矩阵
        preSum = new int[m + 1][n + 1];
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                // 计算每个矩阵 [0, 0, i, j] 的元素和
                preSum[i][j] = preSum[i-1][j] + preSum[i][j-1] + matrix[i - 1][j - 1] - preSum[i-1][j-1];
            }
        }
    }

    // 计算子矩阵 [x1, y1, x2, y2] 的元素和
    public int sumRegion(int x1, int y1, int x2, int y2) {
        // 目标矩阵之和由四个相邻矩阵运算获得
        return preSum[x2+1][y2+1] - preSum[x1][y2+1] - preSum[x2+1][y1] + preSum[x1][y1];
    }
}
```

# 代码模板
## 一维前缀和
```java
class NumArray {
    // 前缀和数组
    private int[] preSum;

    // 输入一个数组，构造前缀和
    public NumArray(int[] nums) {
        // preSum[0] = 0，便于计算累加和
        preSum = new int[nums.length + 1];
        // 计算 nums 的累加和
        for (int i = 1; i < preSum.length; i++) {
            preSum[i] = preSum[i - 1] + nums[i - 1];
        }
    }

    // 查询闭区间 [left, right] 的累加和
    public int sumRange(int left, int right) {
        return preSum[right + 1] - preSum[left];
    }
}
```
## 二维前缀和
```java
class NumMatrix {
    // preSum[i][j] 记录矩阵 [0, 0, i-1, j-1] 的元素和
    private int[][] preSum;

    public NumMatrix(int[][] matrix) {
        int m = matrix.length, n = matrix[0].length;
        if (m == 0 || n == 0) return;
        // 构造前缀和矩阵
        preSum = new int[m + 1][n + 1];
        for (int i = 1; i <= m; i++) {
            for (int j = 1; j <= n; j++) {
                // 计算每个矩阵 [0, 0, i, j] 的元素和
                preSum[i][j] = preSum[i-1][j] + preSum[i][j-1] + matrix[i - 1][j - 1] - preSum[i-1][j-1];
            }
        }
    }

    // 计算子矩阵 [x1, y1, x2, y2] 的元素和
    public int sumRegion(int x1, int y1, int x2, int y2) {
        // 目标矩阵之和由四个相邻矩阵运算获得
        return preSum[x2+1][y2+1] - preSum[x1][y2+1] - preSum[x2+1][y1] + preSum[x1][y1];
    }
}
```
