有了DFS的基础,BFS 非常好理解——**DFS 是“一条路走到黑”，BFS 是“一层一层往外扫”**。

蓝桥杯 Java B 组里，**BFS 只考 2 类核心题**：

1. 迷宫/网格**最短路径**（必考！）
    
2. 连通块统计（岛屿数量、染色问题）
    

而且 BFS 是**求最少步数/最短距离的唯一最优解**，DFS 求最短路径会超时，这是 BFS 最大的价值。

---

## 一、核心概念

### 1. 本质

**广度优先 = 按层遍历**

从起点出发，先搜完所有**距离1步**的点，再搜**距离2步**的点，再搜3步……

天然保证：**第一次到达终点的步数，就是最短步数**。

### 2. 数据结构

BFS 必须用 **队列（Queue）**，先进先出（FIFO）

- DFS：栈/递归（后进先出）
    
- BFS：队列（先进先出）
    

### 3. 核心特点

✅ 适合：**最短路径、最少操作次数、连通块**

❌ 不适合：枚举所有方案、排列组合（这是DFS的活）

✅ 蓝桥杯难度：极低，背模板就能AC

---

## 二、BFS 标准执行步骤（背下来）

1. 定义队列，存入**起点坐标 + 当前步数**
    
2. 定义标记数组 `vis[][]`，标记已访问的点（防止重复走、死循环）
    
3. 循环：队列不为空
    
    1. 取出队头节点
        
    2. 遍历该节点的**上下左右**4个方向
        
    3. 判断新位置：不越界 + 未访问 + 可走
        
    4. 符合条件：入队 + 标记访问 + 步数+1
        
4. 到达终点，直接返回步数（就是最短路径）
    

---

## 三、Java BFS 万能模板

### 模板：迷宫最短路径（最常考）

```Java
import java.util.LinkedList;
import java.util.Queue;
import java.util.Scanner;

// 用类存储坐标+步数
class Node {
    int x, y, step;
    public Node(int x, int y, int step) {
        this.x = x;
        this.y = y;
        this.step = step;
    }
}

public class BFS模板 {
    // 上下左右四个方向
    static int[][] dir = {{-1,0},{1,0},{0,-1},{0,1}};
    static int n, m;
    static char[][] map; // 迷宫地图
    static boolean[][] vis; // 访问标记

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        n = sc.nextInt(); // 行数
        m = sc.nextInt(); // 列数
        map = new char[n][m];
        vis = new boolean[n][m];

        // 读入地图
        for (int i = 0; i < n; i++) {
            map[i] = sc.next().toCharArray();
        }

        // BFS
        Queue<Node> q = new LinkedList<>();
        q.add(new Node(0, 0, 0)); // 起点(0,0)，步数0
        vis[0][0] = true;

        while (!q.isEmpty()) {
            Node now = q.poll(); // 取出队头

            // 到达终点，输出最短步数
            if (now.x == n-1 && now.y == m-1) {
                System.out.println(now.step);
                return;
            }

            // 遍历四个方向
            for (int[] d : dir) {
                int nx = now.x + d[0];
                int ny = now.y + d[1];
                // 判断：不越界 + 未访问 + 可走（不是墙）
                if (nx >=0 && nx <n && ny >=0 && ny <m && !vis[nx][ny] && map[nx][ny] == '.') {
                    vis[nx][ny] = true;
                    q.add(new Node(nx, ny, now.step + 1));
                }
            }
        }
    }
}
```

---

## 四、DFS vs BFS 一眼对比（你会DFS，秒懂）

|维度|DFS 深度优先|BFS 广度优先|
|---|---|---|
|搜索方式|一条路走到黑，碰壁回溯|一层一层向外扩散|
|数据结构|栈（递归/Stack）|队列（Queue）|
|核心用途|枚举所有方案、排列、子集|最短路径、最少步数、连通块|
|蓝桥杯场景|背包、分配、全排列|迷宫、岛屿、最少操作|
|效率|求最短路径极慢|求最短路径最优|

---

## 五、蓝桥杯 BFS 只考这 2 类题

### 1. 迷宫最短路径（高频压轴前题）

题目格式：n行m列迷宫，`#`是墙，`.`是路，求从起点到终点最少走几步。

→ 直接套上面模板，**1分钟写完**。

### 2. 连通块 / FloodFill 染色

题目格式：统计有多少个岛屿、多少个连通区域、把相邻的同色点染色。

→ 只需要改一点点：去掉步数，遍历所有未访问点，每次BFS标记一片连通区域，计数+1。

**极简连通块模板（改2行就行）**

```Java
// 核心代码
int ans = 0;
for (int i = 0; i < n; i++) {
    for (int j = 0; j < m; j++) {
        if (map[i][j] == '1' && !vis[i][j]) {
            ans++;
            bfs(i,j); // BFS染色这片连通块
        }
    }
}
System.out.println(ans);
```

---

## 六、冲刺必记 BFS 坑点（蓝桥杯常错）

1. **必须标记访问****`vis[][]`**
    

2. 不标记会重复入队，死循环+超时。
    

3. **方向数组别写错**
    

4. 上下左右4个方向，别多写少写。
    

5. **边界判断必写**
    

6. `nx >=0 && nx <n && ny >=0 && ny <m`，防止数组越界。
    

7. **队列用****`LinkedList`****实现**
    

8. Java 中 `Queue` 是接口，不能直接new，用`new LinkedList<>()`。
    

9. **BFS找到终点直接return**
    

10. 第一次到终点就是最短路径，不用继续搜。
    

---

## 七、4天冲刺建议

1. 只练**迷宫最短路径**模板，默写3遍，能独立写出来就行。
    
2. 不用学复杂BFS（双向BFS、01BFS），蓝桥杯B组不考。
    
3. 考场遇到**最少步数/最短路径**，直接写BFS，别用DFS。
    
4. 连通块题直接套模板，送分题。
    
