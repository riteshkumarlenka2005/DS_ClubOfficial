-- ============================================
-- PROMOTE OFFICIAL DS CLUB MEMBERS
-- ============================================
-- This migration:
-- 1. Sets role='member' for any existing users with these emails
-- 2. Auto-approves any pending membership_applications for these emails

-- Step 1: Promote existing user accounts to 'member' role
UPDATE public.users
SET role = 'member', updated_at = NOW()
WHERE email IN (
    '23cse513.priyanshugupta@giet.edu',
    '23cseds048.snehashreepanda@giet.edu',
    '23cseds037.chitranshusanket@giet.edu',
    '23cse280.vaishnavipatnaik@giet.edu',
    '24cseaiml022.sushobhanpal@giet.edu',
    '23cse589.khusinayak@giet.edu',
    '23cseds042.abhinavkumar@giet.edu',
    '24cse015.mananpatel@giet.edu',
    '24cseaiml169.puppalaharish@giet.edu',
    '24cse097.milindpanda@giet.edu',
    '24cseds017.saripillimaruthi@giet.edu',
    '24cseaiml079.amankumarsingh@giet.edu',
    '24cseds038.subhasissamantaray@giet.edu',
    '23cseds029.ayushchoudhury@giet.edu',
    '23cse231.deviduttaparida@giet.edu',
    '24cseaiml065.soumyaranjanpadhi@giet.edu',
    '23cse586.jayaprakashsahoo@giet.edu',
    '23cse496.rajkumarsahu@giet.edu',
    '24cseaiml071.ashishpalo@giet.edu',
    '24cseaiml333.srustipanigrahi@giet.edu',
    '24cseaiml281.rudrakshyakumar@giet.edu',
    '24cseds020.gopalkrushnapanda@giet.edu',
    '24cseaiml088.abhinashkumarsingh@giet.edu',
    '24cseds011.radasuvarthika@giet.edu',
    '24cseaiml225.ravullaadhiraj@giet.edu',
    '24cseaiml101.subratjena@giet.edu',
    '23cseaiml027.swatirekhajena@giet.edu',
    '23cse250.pothamsettipradeepkumar@giet.edu',
    '24cse275.meegadadeepika@giet.edu',
    '24cseaiml161.srimayakumarpradhan@giet.edu',
    '23cseds049.lipsasamantray@giet.edu',
    '24cse215.tanmayabhuyan@giet.edu'
)
AND role = 'student';

-- Step 2: Auto-approve any pending membership applications for these emails
UPDATE public.membership_applications
SET status = 'approved', reviewed_at = NOW(), updated_at = NOW()
WHERE email IN (
    '23cse513.priyanshugupta@giet.edu',
    '23cseds048.snehashreepanda@giet.edu',
    '23cseds037.chitranshusanket@giet.edu',
    '23cse280.vaishnavipatnaik@giet.edu',
    '24cseaiml022.sushobhanpal@giet.edu',
    '23cse589.khusinayak@giet.edu',
    '23cseds042.abhinavkumar@giet.edu',
    '24cse015.mananpatel@giet.edu',
    '24cseaiml169.puppalaharish@giet.edu',
    '24cse097.milindpanda@giet.edu',
    '24cseds017.saripillimaruthi@giet.edu',
    '24cseaiml079.amankumarsingh@giet.edu',
    '24cseds038.subhasissamantaray@giet.edu',
    '23cseds029.ayushchoudhury@giet.edu',
    '23cse231.deviduttaparida@giet.edu',
    '24cseaiml065.soumyaranjanpadhi@giet.edu',
    '23cse586.jayaprakashsahoo@giet.edu',
    '23cse496.rajkumarsahu@giet.edu',
    '24cseaiml071.ashishpalo@giet.edu',
    '24cseaiml333.srustipanigrahi@giet.edu',
    '24cseaiml281.rudrakshyakumar@giet.edu',
    '24cseds020.gopalkrushnapanda@giet.edu',
    '24cseaiml088.abhinashkumarsingh@giet.edu',
    '24cseds011.radasuvarthika@giet.edu',
    '24cseaiml225.ravullaadhiraj@giet.edu',
    '24cseaiml101.subratjena@giet.edu',
    '23cseaiml027.swatirekhajena@giet.edu',
    '23cse250.pothamsettipradeepkumar@giet.edu',
    '24cse275.meegadadeepika@giet.edu',
    '24cseaiml161.srimayakumarpradhan@giet.edu',
    '23cseds049.lipsasamantray@giet.edu',
    '24cse215.tanmayabhuyan@giet.edu'
)
AND status = 'pending';
