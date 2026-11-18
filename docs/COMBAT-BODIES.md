脚下圆形代表角色在地图上的占地，不包含头、植物轨道或手推车整个剪影。英雄半径 11，小鬼 8，普通僵尸 12～15，精英 21，Boss 29（世界像素）。敌群按空间分桶，邻近个体软分离。硬装饰只在底部以椭圆阻挡；草、浅水和桥面可走；飞行与潜地单位不占地面空间。物品拾取、投射物和有预警的攻击仍是独立的检测区。

设计依据：[Godot 对静态物体、角色和检测区的区分](https://docs.godotengine.org/en/stable/tutorials/physics/physics_introduction.html)、[Box2D 的圆形及空间查询](https://box2d.org/documentation/md_collision.html)。这些半径和软分离参数是本游戏的调校，并非文档规定值。
