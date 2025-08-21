/**
 * 真实用户数据生成器
 * 生成管理员账户、示例用户账户和用户统计数据
 */

const { pool, query } = require('../config/database');
const bcrypt = require('bcryptjs');

class UserDataGenerator {
  constructor() {
    this.generatedUsers = [];
    this.generatedStats = [];
  }

  /**
   * 生成管理员账户
   */
  async generateAdminUsers() {
    const adminUsers = [
      {
        username: 'admin',
        email: 'admin@zhangshang-shuati.com',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
        nickname: '系统管理员',
        gender: 'other',
        bio: '掌上刷题宝系统管理员，负责平台运营和内容管理',
        learning_goal: '维护平台稳定运行，提供优质学习体验',
        level: 10,
        points: 1000,
        status: 1
      },
      {
        username: 'content_admin',
        email: 'content@zhangshang-shuati.com',
        password: await bcrypt.hash('content123', 10),
        role: 'admin',
        nickname: '内容管理员',
        gender: 'female',
        bio: '负责题目和文章内容的审核与管理',
        learning_goal: '确保平台内容质量，持续优化学习资源',
        level: 8,
        points: 800,
        status: 1
      }
    ];

    console.log('生成管理员账户数据...');
    return adminUsers;
  }

  /**
   * 生成示例用户账户
   */
  async generateSampleUsers() {
    const sampleUsers = [
      {
        username: 'demo_user',
        email: 'demo@zhangshang-shuati.com',
        password: await bcrypt.hash('demo123', 10),
        role: 'user',
        nickname: '演示用户',
        gender: 'male',
        birthday: '1995-06-15',
        bio: '前端开发工程师，热爱学习新技术',
        learning_goal: '提升JavaScript和前端框架技能，准备高级工程师面试',
        level: 3,
        points: 150,
        status: 1
      },
      {
        username: 'student_zhang',
        email: 'zhang.student@example.com',
        password: await bcrypt.hash('student123', 10),
        role: 'user',
        nickname: '张同学',
        gender: 'male',
        birthday: '2000-03-20',
        bio: '计算机科学专业大三学生，正在学习前端开发',
        learning_goal: '掌握前端基础知识，为实习做准备',
        level: 2,
        points: 80,
        status: 1
      },
      {
        username: 'dev_lisa',
        email: 'lisa.dev@example.com',
        password: await bcrypt.hash('lisa123', 10),
        role: 'user',
        nickname: 'Lisa开发者',
        gender: 'female',
        birthday: '1992-11-08',
        bio: '全栈开发工程师，专注于React和Node.js开发',
        learning_goal: '深入学习算法和数据结构，提升编程能力',
        level: 5,
        points: 320,
        status: 1
      },
      {
        username: 'junior_wang',
        email: 'wang.junior@example.com',
        password: await bcrypt.hash('junior123', 10),
        role: 'user',
        nickname: '小王程序员',
        gender: 'male',
        birthday: '1998-07-12',
        bio: '初级前端开发工程师，刚入职半年',
        learning_goal: '巩固JavaScript基础，学习Vue.js框架',
        level: 1,
        points: 45,
        status: 1
      },
      {
        username: 'senior_chen',
        email: 'chen.senior@example.com',
        password: await bcrypt.hash('senior123', 10),
        role: 'user',
        nickname: '陈工',
        gender: 'male',
        birthday: '1988-12-03',
        bio: '资深前端架构师，有8年开发经验',
        learning_goal: '学习最新的前端技术趋势，分享经验给团队',
        level: 7,
        points: 580,
        status: 1
      },
      {
        username: 'intern_amy',
        email: 'amy.intern@example.com',
        password: await bcrypt.hash('intern123', 10),
        role: 'user',
        nickname: 'Amy实习生',
        gender: 'female',
        birthday: '2001-04-25',
        bio: '前端开发实习生，对编程充满热情',
        learning_goal: '快速掌握前端开发技能，成为合格的开发工程师',
        level: 1,
        points: 25,
        status: 1
      },
      {
        username: 'freelancer_tom',
        email: 'tom.freelancer@example.com',
        password: await bcrypt.hash('freelancer123', 10),
        role: 'user',
        nickname: 'Tom自由职业者',
        gender: 'male',
        birthday: '1990-09-18',
        bio: '自由职业前端开发者，为多个项目提供技术支持',
        learning_goal: '保持技术更新，扩展技能栈',
        level: 4,
        points: 240,
        status: 1
      },
      {
        username: 'student_mary',
        email: 'mary.student@example.com',
        password: await bcrypt.hash('mary123', 10),
        role: 'user',
        nickname: 'Mary学习者',
        gender: 'female',
        birthday: '1999-01-30',
        bio: '转行学习前端开发的设计师',
        learning_goal: '从设计转向前端开发，掌握编程技能',
        level: 2,
        points: 95,
        status: 1
      }
    ];

    console.log('生成示例用户账户数据...');
    return sampleUsers;
  }

  /**
   * 生成用户统计数据
   */
  generateUserStats(userId, userLevel, userPoints) {
    // 根据用户等级和积分生成相应的统计数据
    const baseQuestions = userLevel * 20 + Math.floor(Math.random() * 30);
    const correctQuestions = Math.floor(baseQuestions * (0.6 + Math.random() * 0.3)); // 60%-90%正确率
    const correctRate = (correctQuestions / baseQuestions * 100).toFixed(2);
    
    return {
      user_id: userId,
      correct_rate: correctRate,
      continuous_days: Math.floor(Math.random() * 30) + 1, // 1-30天连续学习
      total_questions: baseQuestions,
      correct_questions: correctQuestions,
      rank_position: 0, // 将在插入后重新计算排名
      last_study_date: this.getRandomRecentDate()
    };
  }

  /**
   * 生成用户签到记录
   */
  generateUserCheckins(userId, continuousDays) {
    const checkins = [];
    const today = new Date();
    
    // 生成最近连续签到记录
    for (let i = 0; i < continuousDays; i++) {
      const checkinDate = new Date(today);
      checkinDate.setDate(today.getDate() - i);
      
      checkins.push({
        user_id: userId,
        checkin_date: checkinDate.toISOString().split('T')[0],
        points_earned: 5 + Math.floor(Math.random() * 5) // 5-9积分
      });
    }
    
    return checkins;
  }

  /**
   * 生成用户学习计划
   */
  generateUserStudyPlans(userId, userLevel) {
    const plans = [];
    
    // 根据用户等级生成不同的学习计划
    if (userLevel >= 1) {
      plans.push({
        user_id: userId,
        plan_name: 'JavaScript基础强化',
        target_questions_per_day: 10 + userLevel * 2,
        target_subjects: JSON.stringify(['JavaScript', 'HTML', 'CSS']),
        start_date: this.getRandomPastDate(30),
        end_date: this.getRandomFutureDate(30),
        status: 'active'
      });
    }
    
    if (userLevel >= 3) {
      plans.push({
        user_id: userId,
        plan_name: '前端框架进阶',
        target_questions_per_day: 15,
        target_subjects: JSON.stringify(['Vue.js', 'React', 'JavaScript']),
        start_date: this.getRandomPastDate(15),
        end_date: this.getRandomFutureDate(45),
        status: 'active'
      });
    }
    
    if (userLevel >= 5) {
      plans.push({
        user_id: userId,
        plan_name: '算法与数据结构',
        target_questions_per_day: 8,
        target_subjects: JSON.stringify(['算法', '数据结构']),
        start_date: this.getRandomPastDate(7),
        end_date: this.getRandomFutureDate(60),
        status: 'active'
      });
    }
    
    return plans;
  }

  /**
   * 获取随机的最近日期
   */
  getRandomRecentDate() {
    const today = new Date();
    const daysAgo = Math.floor(Math.random() * 7); // 0-6天前
    const date = new Date(today);
    date.setDate(today.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
  }

  /**
   * 获取随机的过去日期
   */
  getRandomPastDate(maxDaysAgo) {
    const today = new Date();
    const daysAgo = Math.floor(Math.random() * maxDaysAgo) + 1;
    const date = new Date(today);
    date.setDate(today.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
  }

  /**
   * 获取随机的未来日期
   */
  getRandomFutureDate(maxDaysLater) {
    const today = new Date();
    const daysLater = Math.floor(Math.random() * maxDaysLater) + 1;
    const date = new Date(today);
    date.setDate(today.getDate() + daysLater);
    return date.toISOString().split('T')[0];
  }

  /**
   * 插入用户数据到数据库
   */
  async insertUsers(users) {
    const insertedUsers = [];
    
    for (const user of users) {
      try {
        // 检查用户是否已存在
        const existingUser = await query(
          'SELECT id FROM users WHERE username = ? OR email = ?',
          [user.username, user.email]
        );
        
        if (existingUser.length > 0) {
          console.log(`⚠️  用户已存在，跳过: ${user.username}`);
          insertedUsers.push({ ...user, id: existingUser[0].id });
          continue;
        }
        
        // 插入用户
        const result = await query(`
          INSERT INTO users (
            username, email, password, role, nickname, gender, birthday,
            bio, learning_goal, level, points, status
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `, [
          user.username, user.email, user.password, user.role,
          user.nickname, user.gender, user.birthday, user.bio,
          user.learning_goal, user.level, user.points, user.status
        ]);
        
        const insertedUser = { ...user, id: result.insertId };
        insertedUsers.push(insertedUser);
        
        console.log(`✅ 创建用户: ${user.username} (${user.role})`);
        
      } catch (error) {
        console.error(`❌ 创建用户失败 ${user.username}:`, error.message);
      }
    }
    
    return insertedUsers;
  }

  /**
   * 插入用户统计数据
   */
  async insertUserStats(users) {
    for (const user of users) {
      try {
        // 检查统计数据是否已存在
        const existingStats = await query(
          'SELECT id FROM user_stats WHERE user_id = ?',
          [user.id]
        );
        
        if (existingStats.length > 0) {
          console.log(`⚠️  用户统计数据已存在，跳过: ${user.username}`);
          continue;
        }
        
        const stats = this.generateUserStats(user.id, user.level, user.points);
        
        await query(`
          INSERT INTO user_stats (
            user_id, correct_rate, continuous_days, total_questions,
            correct_questions, rank_position, last_study_date
          ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          stats.user_id, stats.correct_rate, stats.continuous_days,
          stats.total_questions, stats.correct_questions,
          stats.rank_position, stats.last_study_date
        ]);
        
        console.log(`✅ 创建用户统计: ${user.username}`);
        
      } catch (error) {
        console.error(`❌ 创建用户统计失败 ${user.username}:`, error.message);
      }
    }
  }

  /**
   * 插入用户签到记录
   */
  async insertUserCheckins(users) {
    for (const user of users) {
      try {
        // 获取用户的连续学习天数
        const statsResult = await query(
          'SELECT continuous_days FROM user_stats WHERE user_id = ?',
          [user.id]
        );
        
        if (statsResult.length === 0) continue;
        
        const continuousDays = Math.min(statsResult[0].continuous_days, 10); // 最多生成10天签到记录
        const checkins = this.generateUserCheckins(user.id, continuousDays);
        
        for (const checkin of checkins) {
          // 检查签到记录是否已存在
          const existingCheckin = await query(
            'SELECT id FROM user_checkins WHERE user_id = ? AND checkin_date = ?',
            [checkin.user_id, checkin.checkin_date]
          );
          
          if (existingCheckin.length > 0) continue;
          
          await query(`
            INSERT INTO user_checkins (user_id, checkin_date, points_earned)
            VALUES (?, ?, ?)
          `, [checkin.user_id, checkin.checkin_date, checkin.points_earned]);
        }
        
        console.log(`✅ 创建签到记录: ${user.username} (${checkins.length}天)`);
        
      } catch (error) {
        console.error(`❌ 创建签到记录失败 ${user.username}:`, error.message);
      }
    }
  }

  /**
   * 插入用户学习计划
   */
  async insertUserStudyPlans(users) {
    for (const user of users) {
      try {
        const plans = this.generateUserStudyPlans(user.id, user.level);
        
        for (const plan of plans) {
          // 检查学习计划是否已存在
          const existingPlan = await query(
            'SELECT id FROM user_study_plans WHERE user_id = ? AND plan_name = ?',
            [plan.user_id, plan.plan_name]
          );
          
          if (existingPlan.length > 0) continue;
          
          await query(`
            INSERT INTO user_study_plans (
              user_id, plan_name, target_questions_per_day, target_subjects,
              start_date, end_date, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
          `, [
            plan.user_id, plan.plan_name, plan.target_questions_per_day,
            plan.target_subjects, plan.start_date, plan.end_date, plan.status
          ]);
        }
        
        console.log(`✅ 创建学习计划: ${user.username} (${plans.length}个计划)`);
        
      } catch (error) {
        console.error(`❌ 创建学习计划失败 ${user.username}:`, error.message);
      }
    }
  }

  /**
   * 更新用户排名
   */
  async updateUserRankings() {
    try {
      console.log('更新用户排名...');
      
      // 根据积分和正确率计算排名
      await query(`
        SET @rank = 0;
        UPDATE user_stats us
        JOIN users u ON us.user_id = u.id
        SET us.rank_position = (@rank := @rank + 1)
        ORDER BY u.points DESC, us.correct_rate DESC, us.total_questions DESC;
      `);
      
      console.log('✅ 用户排名更新完成');
      
    } catch (error) {
      console.error('❌ 更新用户排名失败:', error.message);
    }
  }

  /**
   * 生成所有用户数据
   */
  async generateAllUserData() {
    try {
      console.log('🔄 开始生成真实用户数据...');
      
      // 1. 生成管理员账户
      const adminUsers = await this.generateAdminUsers();
      const insertedAdmins = await this.insertUsers(adminUsers);
      
      // 2. 生成示例用户账户
      const sampleUsers = await this.generateSampleUsers();
      const insertedUsers = await this.insertUsers(sampleUsers);
      
      // 3. 合并所有用户
      const allUsers = [...insertedAdmins, ...insertedUsers];
      
      // 4. 生成用户统计数据
      await this.insertUserStats(allUsers);
      
      // 5. 生成用户签到记录
      await this.insertUserCheckins(allUsers);
      
      // 6. 生成用户学习计划
      await this.insertUserStudyPlans(allUsers);
      
      // 7. 更新用户排名
      await this.updateUserRankings();
      
      console.log(`✅ 用户数据生成完成:`);
      console.log(`   - 管理员账户: ${insertedAdmins.length} 个`);
      console.log(`   - 示例用户账户: ${insertedUsers.length} 个`);
      console.log(`   - 总用户数: ${allUsers.length} 个`);
      
      return allUsers;
      
    } catch (error) {
      console.error('❌ 生成用户数据失败:', error.message);
      throw error;
    }
  }

  /**
   * 验证生成的用户数据
   */
  async validateUserData() {
    try {
      console.log('验证用户数据...');
      
      // 验证用户数量
      const userCount = await query('SELECT COUNT(*) as count FROM users');
      console.log(`✅ 用户总数: ${userCount[0].count}`);
      
      // 验证管理员账户
      const adminCount = await query('SELECT COUNT(*) as count FROM users WHERE role = "admin"');
      console.log(`✅ 管理员账户: ${adminCount[0].count}`);
      
      // 验证用户统计数据
      const statsCount = await query('SELECT COUNT(*) as count FROM user_stats');
      console.log(`✅ 用户统计记录: ${statsCount[0].count}`);
      
      // 验证签到记录
      const checkinCount = await query('SELECT COUNT(*) as count FROM user_checkins');
      console.log(`✅ 签到记录: ${checkinCount[0].count}`);
      
      // 验证学习计划
      const planCount = await query('SELECT COUNT(*) as count FROM user_study_plans');
      console.log(`✅ 学习计划: ${planCount[0].count}`);
      
      // 验证数据完整性
      const incompleteStats = await query(`
        SELECT COUNT(*) as count FROM users u
        LEFT JOIN user_stats us ON u.id = us.user_id
        WHERE us.user_id IS NULL
      `);
      
      if (incompleteStats[0].count > 0) {
        console.log(`⚠️  有 ${incompleteStats[0].count} 个用户缺少统计数据`);
        return false;
      }
      
      console.log('✅ 用户数据验证通过');
      return true;
      
    } catch (error) {
      console.error('❌ 用户数据验证失败:', error.message);
      return false;
    }
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  const generator = new UserDataGenerator();
  
  generator.generateAllUserData()
    .then(async () => {
      const isValid = await generator.validateUserData();
      if (isValid) {
        console.log('🎉 真实用户数据生成和验证完成');
      } else {
        console.log('⚠️  用户数据生成完成，但验证发现问题');
      }
      pool.end();
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 用户数据生成失败:', error);
      pool.end();
      process.exit(1);
    });
}

module.exports = UserDataGenerator;