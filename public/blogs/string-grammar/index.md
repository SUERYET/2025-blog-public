前几天刷到一道比较有代表性的题目,通过读取字符串来实现时间的计算,故就此总结一下这道题的基本思路和重点语法.
## 题目链接与答案
[洛谷P8665<蓝桥杯 2018 省 A> 航班时间](https://www.luogu.com.cn/problem/P8665)  
我提交的答案:
```java
package Imitate.P8665;  
import java.util.Scanner;  
public class Main {  
    public static void main(String[] args) {  
        Scanner sc = new Scanner(System.in);  
        int T = Integer.parseInt(sc.nextLine().trim());//安全读取
        String[] time = new String[T];  
  
        for (int i = 0; i < T; i++) {  
            // 每组数据只有两行！  
            String flight1 = sc.nextLine(); // 去程：起飞时间 降落时间  
            String flight2 = sc.nextLine(); // 回程：起飞时间 降落时间  
  
            // 解析每一行，得到起降的秒数  
            long[] times1 = parseFlightTime(flight1);  
            long[] times2 = parseFlightTime(flight2);  
  
            // 去程时间 = 降落 - 起飞  
            // 回程时间 = 降落 - 起飞  
            // 飞行时间 = (去程时间 + 回程时间) / 2  
            long duration1 = times1[1] - times1[0];  
            long duration2 = times2[1] - times2[0];  
            long ans = (duration1 + duration2) / 2;  
  
            time[i] = formatTime(ans);  
        }  
  
        for (String s : time) {  
            System.out.println(s);  
        }  
    }  
  
    // 解析一行航班时间，返回 [起飞秒数, 降落秒数]  
    public static long[] parseFlightTime(String line) {  
        String[] parts = line.split(" ");  
        // parts[0] = 起飞时间 hh:mm:ss        // parts[1] = 降落时间 hh:mm:ss        // parts[2] = 可选，如 (+1) 或 (+2)  
        long takeoff = toSec(parts[0]);
  
        // 解析降落时间，处理可能的天数后缀  
        String landingStr = parts[1];  
        long landing = toSec(landingStr);  
  
        // 如果有天数后缀  
        if (parts.length > 2) {  
            // parts[2] 格式如 (+1) 或 (+2)            String dayStr = parts[2].substring(2, 3); // 提取数字  
            int days = Integer.parseInt(dayStr);  
            landing += (long) days * 24 * 3600;  
        }  
  
        return new long[]{takeoff, landing};  
    }  
  
    public static long toSec(String time) {  
        String[] hms = time.split(":");  
        int hour = Integer.parseInt(hms[0]);  
        int minute = Integer.parseInt(hms[1]);  
        int second = Integer.parseInt(hms[2]);  
        return (long) hour * 3600 + (long) minute * 60 + second;  
    }  
  
    public static String formatTime(long time) {  
        int hour = (int) (time / 3600);  
        int minute = (int) ((time % 3600) / 60);  
        int second = (int) (time % 60);  
        return String.format("%02d:%02d:%02d", hour, minute, second);  
    }  
}
```
## 题目思路
由于输入样例是这样的
```
3
17:48:19 21:57:24
11:05:18 15:14:23
17:21:07 00:31:46 (+1)
23:02:41 16:13:20 (+1)
10:19:19 20:41:24
22:19:04 16:41:09 (+1)
```
输出样例是这样的
```
04:09:05
12:10:39
14:22:05
```
所以我们按照读取字符串并对其进行解析的思路来解题:
1. 第一行读取到一个数字T,表示数据组数
2. 接下来是`T*2`行的数据,每两行表示往返的起飞时间和降落时间,所以我们选择循环T次,每次读取两行并对这两行数据进行相关处理,用字符串数组`time`来存储每次起降所用的时间(标准化),创建一个方法`parseFlightTime`来返回每次飞行的\[起飞秒数,降落秒数\],在其中调用`toSec`方法来将`DD:MM:SS`字符串转化为秒数以便计算
3. 再通过`降落-起飞`计算单次飞行所用秒数,并往返取平均值,再通过方法`formatTime`来标准化时间以存入数组`time`
4. 遍历并输出数组`time`得到结果.
___
解题总结:
这道题难度不大,难点主要在于字符串的解析以及还原,下面我将总结一下这道题中所常用的Java字符串语法.

## Java字符串基本语法
### 一.核心语法

1. `str.split("分隔符")` —— 字符串切割

- 用指定符号把字符串切成**字符串数组**
- 例子:
```java
"17:21:07".split(":") → ["17", "21", "07"]
```
- 注意:
   a.括号里是**正则**，`. | * + ( )` 这类要转义，但这题不用管  
   b.切割后记得判断数组长度，避免越界

2. `str.indexOf('字符')` —— 找字符位置

- 返回**第一次出现的下标**（从 0 开始）
- 找不到返回 `-1`
- 例子：
```java
"00:31:46 (+1)".indexOf('(') → 下标位置
```

3. `str.charAt(下标)` —— 取某个位置的字符

- 取出字符串中指定位置的单个字符
- 例子：
```java
"(+1)".charAt(2) → '1'
```

4. `str.substring(start, end)` —— 截取子串

- 从 `start` 开始，**到 end 前一个结束**
- **含头不含尾**(重点)
- 例子：
```java
"(+1)".substring(2, 3) → "1"
```

5. `str.contains("内容")` —— 判断是否包含

- 返回 `true / false`
- 常用于判断有没有 `(+1)` 这种后缀
```java
if (str.contains("(")) { ... }
```

6. `str.trim()` —— 去掉首尾空白

- 去掉前后空格、换行、制表符
- 读取数字时非常稳：
```java
sc.nextLine().trim()
```

7. `str.length()` —— 字符串长度

- 返回字符个数
```java
"(+1)".length() → 4
```
---
### 二.字符串 ↔ 数字 转换
1. 字符串 → 数字
```java
Integer.parseInt("123");  // → int 123
```

2. 字符数字 → 整数（快写法）
```java
'5' - '0' → 5
```
因为字符在底层是 ASCII 码，相减直接出数字。
___
### 三、字符串格式化输出（时间专用）
#### `String.format(格式, 数值...)`

```java
String.format("%02d:%02d:%02d", h, m, s);
```

- `%02d`：占两位，不够前面补 0
- `%d`：整数
- `2`：总宽度
- `0`：空位填 0
### 四、这道题里字符串的完整流程

1. 读一行字符串：`sc.nextLine()`
2. 按空格切分：`split(" ")`
   - 起飞时间、降落时间、(+1) 分开
1. 时间按 `:` 切分：`split(":")`
2. 转成小时、分钟、秒
3. 判断是否有 `(`，处理跨天
4. 截取数字：`substring(2, len-1)`
5. 转成数字计算秒数
6. 最后用 `String.format` 输出标准时间
### 五、一句话速记

- **切分用 split**
- **查找用 indexOf**
- **取字符用 charAt**
- **截取用 substring（含头不含尾）**
- **字符串转数字用 parseInt**
- **字符转数字用 - '0'**
- **格式化输出用 %02d**
---
## 额外补充:
### **Java 里字符串怎么读、回车去哪了、会不会被读进去**。

### 1. 两种读取方式的核心区别（必须背下来）

#### ① `sc.next()`

- 读到**空格、回车、制表符**就停
- **不会把回车 / 空格读进字符串**
- 适合读：单词、数字、无空格内容

#### ② `sc.nextLine()`

- 读取**一整行**，直到按下回车
- **回车不会放进字符串里**
- 会把**一行内所有内容**都读走（包括中间空格）
- 读完后，换行符被**扔掉**

#### 重点结论：

##### `nextLine()` 不会把回车 `\n` 放进字符串里！

只会读到换行符**之前**的内容，换行符本身被 “吃掉”。

---
### 2. 那为什么经常会读到空行？？？

这是 Java 输入**最经典的坑**：
```java
int T = sc.nextInt();
String s = sc.nextLine();
```

执行过程：

1. `nextInt()` 只拿走数字
2. **回车还留在输入缓冲区里**
3. `nextLine()` 一进来，第一眼就看到回车
	→ 认为这是一行**空内容**
	→ 读到 `""`（空字符串）

这就是所谓：

**“还没输入就读完了，读到空行”**

---

### 3. 所以怎么安全读取？

#### 方式 A（最稳，上面答案代码用的就是这个）
```java
int T = Integer.parseInt(sc.nextLine().trim());
```

直接用 `nextLine()` 读一整行 → 不会残留回车。

#### 方式 B（必须加吸收）

```java
int T = sc.nextInt();
sc.nextLine(); // 把多余回车吃掉
String line = sc.nextLine();
```

---

### 4. 回到题目

输入行是：

```
17:21:07 00:31:46 (+1)
```

用 `sc.nextLine()` 读取后，得到字符串：

```
"17:21:07 00:31:46 (+1)"
```

- 包含**中间空格**
- **不包含回车**
- 回车已经被处理掉了

---

### 5. 总结（3 句记住一切）

1. **`nextLine()` 读一整行，回车不会放进字符串**
2. 但如果前面用了 `nextInt()`，会**残留回车**，导致读到空行
3. 安全读法：
    - 要么全部用 `nextLine()`
    - 要么 `nextInt()` 后加一句 `sc.nextLine()` 吞掉回车